import { Conge, EnseignantFormateur, Utilisateur } from "../models/index.js";
import {
    JOURS, construireGrille, lireCreneaux, erreur, estPersonnelAdmin, refuser, verifierEtablissement,
} from "./planning.service.js";
import { datesParJour } from "../utils/conges.js";

const nomComplet = (u) => (u ? `${u.usr_prenom} ${u.usr_nom}` : null);

export const creneauxImpactesParConge = async (conge_id, user) => {
    if (!estPersonnelAdmin(user)) refuser();

    const conge = await Conge.findByPk(conge_id, {
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_id", "usr_nom", "usr_prenom", "eta_id"] }],
    });
    if (!conge) erreur(404, `Congé introuvable : ${conge_id}`);
    verifierEtablissement(user, conge.utilisateur?.eta_id);

    // congé -> utilisateur -> profil enseignant
    const enseignant = await EnseignantFormateur.findOne({ where: { usr_id: conge.usr_id } });
    if (!enseignant) erreur(422, "Ce congé ne concerne pas un enseignant : aucun créneau n'est impacté.");

    const dates = datesParJour(conge.conge_date_debut, conge.conge_date_fin);
    const creneaux = await lireCreneaux({ enseignant_id: enseignant.enseignant_id });

    const impactes = construireGrille(creneaux.filter((c) => dates[c.plan_jour]))
        .flatMap(({ jour, creneaux: lignes }) =>
            lignes.map((ligne) => ({ jour, ...ligne, dates_impactees: dates[jour] }))
        );

    return {
        conge: {
            id: conge.conge_id,
            date_debut: conge.conge_date_debut,
            date_fin: conge.conge_date_fin,
            motif: conge.conge_motif,
            statut: conge.rh_statut_conge,
        },
        enseignant: { id: enseignant.enseignant_id, nom: nomComplet(conge.utilisateur) },
        impact_effectif: conge.rh_statut_conge === "valide",
        jours_concernes: JOURS.filter((j) => dates[j]),
        total: impactes.length,
        creneaux: impactes,
    };
};