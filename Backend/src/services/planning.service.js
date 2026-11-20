import sequelize from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
    CreneauPlanning, Classe, Matiere, Salle, EnseignantFormateur, Utilisateur,
    EleveApprenant, ParentTuteur, EstResponsableDe, Inscription, Conge,
} from "../models/index.js";
import { datesParJour, intersection } from "../utils/conges.js";

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

export const erreur = (status, message) => {
    const error = new Error(message);
    error.status = status;
    throw error;
};

export const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];


const normaliserRole = (role = "") =>
    role.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const estPersonnelAdmin = (user) => ["direction", "personnel"].includes(normaliserRole(user.usr_role));

export const affichage = (h) => String(h).slice(0, 5);

// Même règle que le reste du projet : un compte rattaché à un établissement ne sort pas du sien
export const verifierEtablissement = (user, eta_id) => {
    if (user?.eta_id && eta_id && user.eta_id !== eta_id) {
        erreur(403, "Accès refusé : ressource d'un autre établissement.");
    }
};

export const refuser = () => erreur(403, "Accès refusé : ce planning ne vous concerne pas.");

/* ------------------------------------------------------------------ */
/* Format de réponse d'une grille                                      */
/* ------------------------------------------------------------------ */

const INCLUDES = [
    { model: Classe, as: "classe", attributes: ["code_classe", "libelle_classe"] },
    { model: Matiere, as: "matiere", attributes: ["matiere_id", "matiere_libelle"] },
    { model: Salle, as: "salle", attributes: ["salle_id", "salle_nom"] },
    {
        model: EnseignantFormateur,
        as: "enseignant",
        attributes: ["enseignant_id"],
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_nom", "usr_prenom"] }],
    },
];

const versLigne = (c) => ({
    plan_id: c.plan_id,
    heure_debut: affichage(c.plan_heure_debut),
    heure_fin: affichage(c.plan_heure_fin),
    matiere: c.matiere ? { id: c.matiere.matiere_id, libelle: c.matiere.matiere_libelle } : null,
    enseignant: c.enseignant
        ? {
              id: c.enseignant.enseignant_id,
              nom: c.enseignant.utilisateur
                  ? `${c.enseignant.utilisateur.usr_prenom} ${c.enseignant.utilisateur.usr_nom}`
                  : null,
          }
        : null,
    salle: c.salle ? { id: c.salle.salle_id, nom: c.salle.salle_nom } : null,
    classe: c.classe ? { code: c.classe.code_classe, libelle: c.classe.libelle_classe } : null,
});

// 7 jours toujours présents, dans l'ordre de la semaine ; créneaux triés par heure
export const construireGrille = (creneaux) => {
    const parJour = new Map(JOURS.map((j) => [j, []]));

    for (const c of creneaux) {
        if (parJour.has(c.plan_jour)) parJour.get(c.plan_jour).push(c);
    }

    return JOURS.map((jour) => ({
        jour,
        creneaux: parJour
            .get(jour)
            .sort((a, b) =>
                String(a.plan_heure_debut).localeCompare(String(b.plan_heure_debut)) ||
                String(a.plan_heure_fin).localeCompare(String(b.plan_heure_fin))
            )
            .map(versLigne),
    }));
};

// Seuls les créneaux actifs apparaissent dans un planning
export const lireCreneaux = (where) =>
    CreneauPlanning.findAll({
        where: { ...where, plan_statut: "actif" },
        include: INCLUDES,
    }).then((rows) => rows.map((r) => r.toJSON()));

/* ------------------------------------------------------------------ */
/* Identité métier de l'utilisateur connecté (via usr_id du JWT)       */
/* ------------------------------------------------------------------ */

const profilEleve = (user) => EleveApprenant.findOne({ where: { usr_id: user.usr_id } });
const profilEnseignant = (user) => EnseignantFormateur.findOne({ where: { usr_id: user.usr_id } });

const matriculesDesEnfants = async (user) => {
    const parent = await ParentTuteur.findOne({ where: { usr_id: user.usr_id } });
    if (!parent) return [];
    const liens = await EstResponsableDe.findAll({ where: { com_id: parent.com_id }, attributes: ["mat_eleve"] });
    return liens.map((l) => l.mat_eleve);
};

// Déduction : inscription VALIDÉE (la plus récente) -> classe -> créneaux actifs
const inscriptionValidee = (mat_eleve) =>
    Inscription.findOne({
        where: { mat_eleve, statut_inscription: "validee" },
        order: [["date_inscription", "DESC"], ["ins_id", "DESC"]],
    });

/* ------------------------------------------------------------------ */
/* VUE ÉLÈVE                                                           */
/* ------------------------------------------------------------------ */

export const planningEleve = async (mat_eleve, user) => {
    const role = normaliserRole(user.usr_role);

    // 1) Contrôle « propriétaire » AVANT toute lecture de la ressource (pas de fuite d'existence)
    if (role === "eleve") {
        const moi = await profilEleve(user);
        if (!moi || moi.mat_eleve !== mat_eleve) refuser();
    } else if (role === "parent") {
        const enfants = await matriculesDesEnfants(user);
        if (!enfants.includes(mat_eleve)) refuser();
    } else if (!estPersonnelAdmin(user)) {
        refuser();
    }

    const eleve = await EleveApprenant.findByPk(mat_eleve);
    if (!eleve) erreur(404, `Élève introuvable : ${mat_eleve}`);

    const inscription = await inscriptionValidee(mat_eleve);
    if (!inscription) {
        return {
            eleve: { mat_eleve, nom: `${eleve.prenom_eleve} ${eleve.nom_eleve}` },
            classe: null,
            semaine: construireGrille([]),
        };
    }

    const classe = await Classe.findByPk(inscription.code_classe);
    if (estPersonnelAdmin(user)) verifierEtablissement(user, classe?.eta_id);

    const creneaux = await lireCreneaux({ code_classe: inscription.code_classe });

    return {
        eleve: { mat_eleve, nom: `${eleve.prenom_eleve} ${eleve.nom_eleve}` },
        classe: { code: classe.code_classe, libelle: classe.libelle_classe },
        semaine: construireGrille(creneaux),
    };
};

/* ------------------------------------------------------------------ */
/* VUE CLASSE                                                          */
/* ------------------------------------------------------------------ */

export const planningClasse = async (code_classe, user) => {
    const role = normaliserRole(user.usr_role);

    if (role === "enseignant") {
        // « le sien et celui de ses classes » : une classe où il a au moins un créneau actif
        const prof = await profilEnseignant(user);
        const nb = prof
            ? await CreneauPlanning.count({ where: { code_classe, enseignant_id: prof.enseignant_id, plan_statut: "actif" } })
            : 0;
        if (nb === 0) refuser();
    } else if (role === "eleve") {
        const moi = await profilEleve(user);
        const ins = moi ? await inscriptionValidee(moi.mat_eleve) : null;
        if (!ins || ins.code_classe !== code_classe) refuser();
    } else if (role === "parent") {
        const enfants = await matriculesDesEnfants(user);
        const nb = enfants.length
            ? await Inscription.count({
                  where: { mat_eleve: enfants, code_classe, statut_inscription: "validee" },
              })
            : 0;
        if (nb === 0) refuser();
    } else if (!estPersonnelAdmin(user)) {
        refuser();
    }

    const classe = await Classe.findByPk(code_classe);
    if (!classe) erreur(404, `Classe introuvable : ${code_classe}`);
    verifierEtablissement(user, classe.eta_id);

    const creneaux = await lireCreneaux({ code_classe });

    return {
        classe: { code: classe.code_classe, libelle: classe.libelle_classe },
        semaine: construireGrille(creneaux),
    };
};

/*
 * Indicateur « en congé » pour la vue enseignant sur une période [du, au].
*/
const congesSurPeriode = async (usr_id, { du, au }) => {
    const conges = await Conge.findAll({
        where: {
            usr_id,
            rh_statut_conge: "valide",
            conge_date_debut: { [Op.lte]: au },
            conge_date_fin: { [Op.gte]: du },
        },
        order: [["conge_date_debut", "ASC"]],
    });

    const union = {};
    for (const c of conges) {
        const commun = intersection({ debut: du, fin: au }, { debut: c.conge_date_debut, fin: c.conge_date_fin });
        for (const [jour, liste] of Object.entries(datesParJour(commun.debut, commun.fin))) {
            union[jour] = [...new Set([...(union[jour] ?? []), ...liste])].sort();
        }
    }

    return {
        conges: conges.map((c) => ({ conge_id: c.conge_id, date_debut: c.conge_date_debut, date_fin: c.conge_date_fin })),
        datesParJour: union,
    };
};

/* ------------------------------------------------------------------ */
/* VUE ENSEIGNANT                                                      */
/* ------------------------------------------------------------------ */

export const planningEnseignant = async (enseignant_id, user, periode = null) => {
    const role = normaliserRole(user.usr_role);

    if (role === "enseignant") {
        const moi = await profilEnseignant(user);
        if (!moi || moi.enseignant_id !== enseignant_id) refuser(); // pas le planning d'un collègue
    } else if (!estPersonnelAdmin(user)) {
        refuser();
    }

    const prof = await EnseignantFormateur.findByPk(enseignant_id, {
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_nom", "usr_prenom", "eta_id"] }],
    });
    if (!prof) erreur(404, `Enseignant introuvable : ${enseignant_id}`);
    verifierEtablissement(user, prof.utilisateur?.eta_id);

    const creneaux = await lireCreneaux({ enseignant_id });
    const semaine = construireGrille(creneaux);

    const reponse = {
        enseignant: {
            id: prof.enseignant_id,
            nom: prof.utilisateur ? `${prof.utilisateur.usr_prenom} ${prof.utilisateur.usr_nom}` : null,
        },
        semaine,
    };

    // Indicateur « en congé » : calculé à la volée sur la période demandée, jamais stocké (RG-PLAN-06)
    if (periode) {
        const { conges, datesParJour: absences } = await congesSurPeriode(prof.usr_id, periode);

        for (const { jour, creneaux: lignes } of semaine) {
            for (const ligne of lignes) {
                ligne.dates_en_conge = absences[jour] ?? [];
                ligne.en_conge = ligne.dates_en_conge.length > 0;
            }
        }
        reponse.periode = { du: periode.du, au: periode.au };
        reponse.conges = conges;
    }

    return reponse;
};

/* ------------------------------------------------------------------ */
/* VUE SALLE (direction / personnel uniquement)                        */
/* ------------------------------------------------------------------ */

export const planningSalle = async (salle_id, user) => {
    if (!estPersonnelAdmin(user)) refuser();

    const salle = await Salle.findByPk(salle_id);
    if (!salle) erreur(404, `Salle introuvable : ${salle_id}`);
    verifierEtablissement(user, salle.eta_id);

    const creneaux = await lireCreneaux({ salle_id });

    return {
        salle: { id: salle.salle_id, nom: salle.salle_nom, capacite: salle.capacite },
        semaine: construireGrille(creneaux),
    };
};

/* ------------------------------------------------------------------ */
/* SALLES LIBRES : toutes les salles de l'établissement                */
/*                 moins celles ayant un créneau ACTIF qui chevauche   */
/* ------------------------------------------------------------------ */

// Exportée pour que le script EXPLAIN analyse exactement la requête exécutée en production.
// Chevauchement strict : débutExistant < finDemandée ET finExistant > débutDemandé
// (une salle libérée à 10:00 est donc libre pour 10:00–12:00).
export const construireSqlSallesLibres = ({ avecCapacite = false } = {}) => `
    SELECT s.salle_id, s.salle_nom, s.capacite
      FROM salle s
     WHERE s.eta_id = :eta_id
       ${avecCapacite ? "AND s.capacite >= :capacite_min" : ""}
       AND NOT EXISTS (
            SELECT 1
              FROM creneau_planning c
             WHERE c.salle_id = s.salle_id
               AND c.plan_jour = :jour
               AND c.plan_statut = 'actif'
               AND c.plan_heure_debut < :fin
               AND c.plan_heure_fin > :debut
       )
     ORDER BY s.salle_nom
`;

export const sallesLibres = async ({ eta_id, jour, debut, fin, capacite_min = null }, user) => {
    if (!estPersonnelAdmin(user)) refuser();
    verifierEtablissement(user, eta_id);

    const avecCapacite = capacite_min !== null && capacite_min !== undefined;
    const salles = await sequelize.query(construireSqlSallesLibres({ avecCapacite }), {
        replacements: { eta_id, jour, debut, fin, ...(avecCapacite && { capacite_min }) },
        type: QueryTypes.SELECT,
    });

    return {
        jour,
        heure_debut: affichage(debut),
        heure_fin: affichage(fin),
        total: salles.length,
        salles,
    };
};