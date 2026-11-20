import sequelize from "../../config/database.js";
import { Op } from "sequelize";
import { CreneauPlanning, Classe, Matiere, EnseignantFormateur, Utilisateur, Salle, Enseign, Etablissement } from "../models/index.js";
import { heureEnSecondes, trouverConflits } from "../utils/chevauchement.js";
const erreur = (status, message) => {
    const error = new Error(message);
    error.status = status;
    throw error;
};

// Normalise HH:MM en HH:MM:SS pour l'enregistrement
const normaliserHeure = (h) => (h.length === 5 ? `${h}:00` : h);
const affichage = (h) => h.slice(0, 5); 


/*
 * Contrôles métier d'un créneau : RG-PLAN-01 (références valides), 05, 07, 08.
 *
 * evaluerRegles() COLLECTE tous les problèmes : la simulation doit tout expliquer d'un coup.
 * verifierRegles() s'arrête au premier : création et modification.
 * Une seule source de vérité, donc la simulation et la création ne peuvent pas diverger.
 *
 * Codes HTTP : 404 référence introuvable, 422 règle métier violée.
 * Un accès à un autre établissement (403) est toujours levé immédiatement.
 */
const probleme = (status, code, regle, message) => ({ status, code, regle, message });

export const evaluerRegles = async (data, currentUser) => {
    const problemes = [];

    /* RG-PLAN-01 : toutes les références doivent exister */
    const classe = await Classe.findByPk(data.code_classe);

    if (classe && currentUser?.eta_id && classe.eta_id !== currentUser.eta_id) {
        erreur(403, "Accès refusé : cette classe appartient à un autre établissement.");
    }

    const matiere = await Matiere.findByPk(data.matiere_id);
    const enseignant = await EnseignantFormateur.findByPk(data.enseignant_id, {
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_id", "usr_nom", "usr_prenom", "eta_id"] }],
    });
    const salle = await Salle.findByPk(data.salle_id);

    if (!classe) problemes.push(probleme(404, "CLASSE_INTROUVABLE", "RG-PLAN-01", `Classe introuvable : ${data.code_classe}`));
    if (!matiere) problemes.push(probleme(404, "MATIERE_INTROUVABLE", "RG-PLAN-01", `Matière introuvable : ${data.matiere_id}`));
    if (!enseignant) problemes.push(probleme(404, "ENSEIGNANT_INTROUVABLE", "RG-PLAN-01", `Enseignant introuvable : ${data.enseignant_id}`));
    if (!salle) problemes.push(probleme(404, "SALLE_INTROUVABLE", "RG-PLAN-01", `Salle introuvable : ${data.salle_id}`));

    // Sans toutes les références, les autres contrôles n'ont pas de sens
    if (problemes.length > 0) return { problemes, contexte: null };

    /* Cohérence entre établissements : tout doit appartenir à celui de la classe */
    if (salle.eta_id !== classe.eta_id) {
        problemes.push(
            probleme(422, "SALLE_AUTRE_ETABLISSEMENT", "RG-ETAB-02", `La salle « ${salle.salle_nom} » n'appartient pas à l'établissement de la classe.`)
        );
    }

    const etaEnseignant = enseignant.utilisateur?.eta_id;
    if (etaEnseignant && etaEnseignant !== classe.eta_id) {
        problemes.push(probleme(422, "ENSEIGNANT_AUTRE_ETABLISSEMENT", null, "L'enseignant n'appartient pas à l'établissement de la classe."));
    }

    if (!enseignant.enseignant_statut) {
        problemes.push(probleme(422, "ENSEIGNANT_INACTIF", null, "Cet enseignant est inactif : aucun créneau ne peut lui être affecté."));
    }

    /* RG-PLAN-05 : le créneau reste dans la plage horaire officielle de l'établissement */
    const etablissement = await Etablissement.findByPk(classe.eta_id);
    const ouverture = heureEnSecondes(etablissement.eta_heure_ouverture);
    const fermeture = heureEnSecondes(etablissement.eta_heure_fermeture);
    const debut = heureEnSecondes(data.plan_heure_debut);
    const fin = heureEnSecondes(data.plan_heure_fin);

    if (debut < ouverture || fin > fermeture) {
        problemes.push(
            probleme(
                422,
                "HORS_PLAGE_HORAIRE",
                "RG-PLAN-05",
                `Le créneau ${affichage(data.plan_heure_debut)}–${affichage(data.plan_heure_fin)} dépasse la plage horaire ` +
                    `de l'établissement (${affichage(etablissement.eta_heure_ouverture)}–${affichage(etablissement.eta_heure_fermeture)}).`
            )
        );
    }

    /* RG-PLAN-07 : l'enseignant doit être habilité pour cette matière */
    const habilitation = await Enseign.findOne({
        where: { matiere_id: matiere.matiere_id, enseignant_id: enseignant.enseignant_id },
    });
    if (!habilitation) {
        const nom = enseignant.utilisateur
            ? `${enseignant.utilisateur.usr_prenom} ${enseignant.utilisateur.usr_nom}`
            : `n°${enseignant.enseignant_id}`;
        problemes.push(
            probleme(422, "ENSEIGNANT_NON_HABILITE", "RG-PLAN-07", `L'enseignant ${nom} n'est pas habilité à enseigner la matière ${matiere.matiere_libelle}.`)
        );
    }

    /* RG-PLAN-08 : la capacité de la salle (si renseignée) couvre l'effectif de la classe */
    if (salle.capacite !== null && classe.effectif_classe !== null && salle.capacite < classe.effectif_classe) {
        problemes.push(
            probleme(
                422,
                "SALLE_TROP_PETITE",
                "RG-PLAN-08",
                `La salle « ${salle.salle_nom} » (capacité ${salle.capacite}) est trop petite pour la classe ` +
                    `${classe.libelle_classe} (effectif ${classe.effectif_classe}).`
            )
        );
    }

    return { problemes, contexte: { classe, matiere, enseignant, salle } };
};

export const verifierRegles = async (data, currentUser) => {
    const { problemes, contexte } = await evaluerRegles(data, currentUser);
    if (problemes.length > 0) erreur(problemes[0].status, problemes[0].message);
    return contexte;
};

const LIBELLES = { enseignant: "L'enseignant", salle: "La salle", classe: "La classe" };

const chercherConflits = async (colonne, valeur, donnees, ignorerPlanId, transaction) => {   // <-- changed
    const where = {
        [colonne]: valeur,
        plan_jour: donnees.plan_jour,
        plan_statut: "actif",
        plan_heure_debut: { [Op.lt]: donnees.plan_heure_fin }, // débutExistant < finNouveau
        plan_heure_fin: { [Op.gt]: donnees.plan_heure_debut }, // finExistant   > débutNouveau
    };
    if (ignorerPlanId !== null) where.plan_id = { [Op.ne]: ignorerPlanId };

    const candidats = await CreneauPlanning.findAll({
        where,
        ...(transaction && { transaction }),   // <-- changed (new line)
        include: [
            { model: Classe, as: "classe", attributes: ["code_classe", "libelle_classe"] },
            { model: Matiere, as: "matiere", attributes: ["matiere_id", "matiere_libelle"] },
            { model: Salle, as: "salle", attributes: ["salle_id", "salle_nom"] },
            {
                model: EnseignantFormateur,
                as: "enseignant",
                attributes: ["enseignant_id"],
                include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_nom", "usr_prenom"] }],
            },
        ],
    });

    const lignes = candidats.map((c) => c.toJSON());
    return trouverConflits(donnees, lignes, ignorerPlanId);
};

const decrire = (type, c) => {
    const prof = c.enseignant?.utilisateur
        ? `${c.enseignant.utilisateur.usr_prenom} ${c.enseignant.utilisateur.usr_nom}`
        : `n°${c.enseignant?.enseignant_id}`;

    return (
        `${LIBELLES[type]} est déjà pris(e) le ${c.plan_jour} de ${affichage(c.plan_heure_debut)} à ${affichage(c.plan_heure_fin)} ` +
        `(classe ${c.classe?.libelle_classe ?? c.code_classe}, matière ${c.matiere?.matiere_libelle}, ` +
        `salle ${c.salle?.salle_nom}, enseignant ${prof}).`
    );
};

const REGLES_CONFLIT = { enseignant: "RG-PLAN-02", salle: "RG-PLAN-03", classe: "RG-PLAN-04" };

// Retourne la liste des conflits [{ type, creneau }] sans lever d'erreur (utilisée aussi par la simulation)
const rechercherConflits = async (donnees, ignorerPlanId = null, transaction = null) => {
    // Ordre fixe : enseignant, salle, classe (c'est aussi l'ordre des verrous)
    const verifications = [
        ["enseignant", "enseignant_id", donnees.enseignant_id],
        ["salle", "salle_id", donnees.salle_id],
        ["classe", "code_classe", donnees.code_classe],
    ];

    const conflits = [];
    for (const [type, colonne, valeur] of verifications) {
        const trouves = await chercherConflits(colonne, valeur, donnees, ignorerPlanId, transaction);
        for (const c of trouves) conflits.push({ type, creneau: c });
    }
    return conflits;
};

const detaillerConflits = (conflits) =>
    conflits.map(({ type, creneau: c }) => ({
        type, // "enseignant" | "salle" | "classe"
        regle: REGLES_CONFLIT[type],
        plan_id: c.plan_id,
        plan_jour: c.plan_jour,
        plan_heure_debut: c.plan_heure_debut,
        plan_heure_fin: c.plan_heure_fin,
        code_classe: c.code_classe,
        classe: c.classe?.libelle_classe ?? null,
        matiere: c.matiere?.matiere_libelle ?? null,
        salle: c.salle?.salle_nom ?? null,
    }));

export const verifierConflits = async (donnees, ignorerPlanId = null, transaction = null) => {
    const conflits = await rechercherConflits(donnees, ignorerPlanId, transaction);
    if (conflits.length === 0) return;

    const error = new Error(conflits.map(({ type, creneau }) => decrire(type, creneau)).join(" "));
    error.status = 409;
    error.details = detaillerConflits(conflits);
    throw error;
};


const verrouillerLignes = async (Modele, cle, valeurs, transaction) => {
    const triees = [...new Set(valeurs.filter((v) => v !== null && v !== undefined))].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
    );

    for (const valeur of triees) {
        await Modele.findByPk(valeur, { transaction, lock: transaction.LOCK.UPDATE, attributes: [cle] });
    }
};

const verrouiller = async (donnees, transaction, courant = null) => {
    await verrouillerLignes(EnseignantFormateur, "enseignant_id", [donnees.enseignant_id, courant?.enseignant_id], transaction);
    await verrouillerLignes(Salle, "salle_id", [donnees.salle_id, courant?.salle_id], transaction);
    await verrouillerLignes(Classe, "code_classe", [donnees.code_classe, courant?.code_classe], transaction);
};

export const createCreneau = async (data, currentUser) => {
    // On normalise les heures AVANT les contrôles et l'enregistrement
    const donnees = {
        ...data,
        plan_heure_debut: normaliserHeure(data.plan_heure_debut),
        plan_heure_fin: normaliserHeure(data.plan_heure_fin),
    };

    // 1) Contrôles qui ne dépendent pas de la concurrence : EN DEHORS de la transaction
    //    (ils font des lectures simples, qui ne doivent pas précéder les verrous).
    await verifierRegles(donnees, currentUser);

    // 2) Transaction : verrous -> contrôle des chevauchements -> insertion.
    //    Si une erreur est levée (409), la transaction est annulée automatiquement.
    return sequelize.transaction(async (transaction) => {
        await verrouiller(donnees, transaction);
        
        await verifierConflits(donnees, null, transaction);

        return CreneauPlanning.create(
            {
                code_classe: donnees.code_classe,
                matiere_id: donnees.matiere_id,
                enseignant_id: donnees.enseignant_id,
                salle_id: donnees.salle_id,
                plan_jour: donnees.plan_jour,
                plan_heure_debut: donnees.plan_heure_debut,
                plan_heure_fin: donnees.plan_heure_fin,
                plan_statut: "actif",
            },
            { transaction }
        );
    });
};

/* ------------------------------------------------------------------ */
/* MODIFICATION                                                        */
/* ------------------------------------------------------------------ */

const CHAMPS_CRENEAU = [
    "code_classe", "matiere_id", "enseignant_id", "salle_id",
    "plan_jour", "plan_heure_debut", "plan_heure_fin", "plan_statut",
];
// Empreinte d'un créneau : sert à détecter qu'il a changé entre la lecture et le verrou
const empreinte = (creneau) => JSON.stringify(CHAMPS_CRENEAU.map((champ) => creneau[champ]));

const verifierAcces = async (creneau, currentUser, transaction) => {
    const classe = await Classe.findByPk(creneau.code_classe, transaction ? { transaction } : undefined);
    if (currentUser?.eta_id && classe?.eta_id !== currentUser.eta_id) {
        erreur(403, "Accès refusé : ce créneau appartient à un autre établissement.");
    }
};

export const modifierCreneau = async (plan_id, data, currentUser) => {
    const existant = await CreneauPlanning.findByPk(plan_id);
    if (!existant) erreur(404, `Créneau introuvable : ${plan_id}`);

    await verifierAcces(existant, currentUser);

    if (existant.plan_statut === "annule") {
        erreur(422, "Un créneau annulé ne peut pas être modifié : créez-en un nouveau.");
    }

    const avant = existant.toJSON();

    // Le créneau final = l'existant + les champs envoyés (modification partielle autorisée)
    const cible = { ...avant, ...data };
    if (data.plan_heure_debut) cible.plan_heure_debut = normaliserHeure(data.plan_heure_debut);
    if (data.plan_heure_fin) cible.plan_heure_fin = normaliserHeure(data.plan_heure_fin);

    if (heureEnSecondes(cible.plan_heure_fin) <= heureEnSecondes(cible.plan_heure_debut)) {
        erreur(400, "L'heure de fin doit être strictement après l'heure de début.");
    }

    // 1) Contrôles métier (lectures simples) : AVANT la transaction
    await verifierRegles(cible, currentUser);

    // 2) Transaction : verrou du créneau -> verrous des ressources -> conflits -> mise à jour
    return sequelize.transaction(async (transaction) => {
        // Verrou du créneau lui-même, toujours en premier (modification et annulation
        // suivent le même ordre : créneau, enseignant, salle, classe)
        const verrouille = await CreneauPlanning.findByPk(plan_id, { transaction, lock: transaction.LOCK.UPDATE });

        if (!verrouille || empreinte(verrouille) !== empreinte(avant)) {
            erreur(409, "Ce créneau vient d'être modifié ou annulé par un autre utilisateur. Rechargez-le et réessayez.");
        }

        await verrouiller(cible, transaction, avant);

        // Le créneau ne doit pas entrer en conflit avec lui-même : on l'exclut (ignorerPlanId)
        await verifierConflits(cible, plan_id, transaction);

        await verrouille.update(
            {
                code_classe: cible.code_classe,
                matiere_id: cible.matiere_id,
                enseignant_id: cible.enseignant_id,
                salle_id: cible.salle_id,
                plan_jour: cible.plan_jour,
                plan_heure_debut: cible.plan_heure_debut,
                plan_heure_fin: cible.plan_heure_fin,
            },
            { transaction }
        );

        return verrouille;
    });
};

/* ------------------------------------------------------------------ */
/* ANNULATION (pas de suppression : plan_statut = 'annule')            */
/* ------------------------------------------------------------------ */

export const annulerCreneau = async (plan_id, currentUser) => {
    return sequelize.transaction(async (transaction) => {
        const creneau = await CreneauPlanning.findByPk(plan_id, { transaction, lock: transaction.LOCK.UPDATE });
        if (!creneau) erreur(404, `Créneau introuvable : ${plan_id}`);

        await verifierAcces(creneau, currentUser, transaction);

        // Annuler deux fois n'est pas une erreur : l'opération est idempotente
        if (creneau.plan_statut === "annule") return { creneau, dejaAnnule: true };

        await creneau.update({ plan_statut: "annule" }, { transaction });
        return { creneau, dejaAnnule: false };
    });
};

/* ------------------------------------------------------------------ */
/* SIMULATION : explique tout ce qui bloquerait, sans rien enregistrer */
/* ------------------------------------------------------------------ */


export const simulerCreneau = async (data, currentUser) => {
    const { plan_id = null, ...creneau } = data;

    const donnees = {
        ...creneau,
        plan_heure_debut: normaliserHeure(creneau.plan_heure_debut),
        plan_heure_fin: normaliserHeure(creneau.plan_heure_fin),
    };

    const { problemes, contexte } = await evaluerRegles(donnees, currentUser);

    // Les conflits n'ont de sens que si toutes les références existent
    const conflits = contexte ? await rechercherConflits(donnees, plan_id) : [];
    const detailsConflits = detaillerConflits(conflits).map((detail, i) => ({
        ...detail,
        message: decrire(conflits[i].type, conflits[i].creneau),
    }));

    return {
        valide: problemes.length === 0 && conflits.length === 0,
        problemes: problemes.map(({ status, ...reste }) => reste),
        conflits: detailsConflits,
    };
};