/*
 * Détection de chevauchement entre créneaux hebdomadaires récurrents.
 */
export const heureEnSecondes = (heure) => {
    const correspondance =
        typeof heure === "string" ? /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(heure.trim()) : null;

    if (!correspondance) {
        throw new Error(`Heure invalide : "${heure}" (format attendu HH:MM ou HH:MM:SS)`);
    }

    const [, heures, minutes, secondes] = correspondance;
    return Number(heures) * 3600 + Number(minutes) * 60 + Number(secondes ?? 0);
};

const versSecondes = (plage) => {
    const debut = heureEnSecondes(plage.debut);
    const fin = heureEnSecondes(plage.fin);

    if (fin <= debut) {
        throw new Error(`Plage invalide : la fin (${plage.fin}) doit être après le début (${plage.debut}).`);
    }

    return { debut, fin };
};

/**
 * @param {{debut: string, fin: string}} plageA
 * @param {{debut: string, fin: string}} plageB
 * @returns {boolean} true si les deux plages se chevauchent (bornes strictes)
 */
export const seChevauchent = (plageA, plageB) => {
    const a = versSecondes(plageA);
    const b = versSecondes(plageB);

    return a.debut < b.fin && b.debut < a.fin;
};

/**
 * Filtre, parmi des créneaux existants, ceux qui sont en conflit avec un nouveau créneau.
 * Ignore : les créneaux annulés, les créneaux d'un autre jour, et (optionnel) le créneau
 * en cours de modification (ignorerPlanId).
 *
 * Les objets suivent les noms de colonnes de creneau_planning :
 * plan_id, plan_jour, plan_heure_debut, plan_heure_fin, plan_statut.
 */
export const trouverConflits = (nouveau, existants, ignorerPlanId = null) => {
    const plageNouveau = { debut: nouveau.plan_heure_debut, fin: nouveau.plan_heure_fin };

    return existants.filter((existant) => {
        if (existant.plan_statut === "annule") return false;
        if (existant.plan_jour !== nouveau.plan_jour) return false;
        if (ignorerPlanId !== null && existant.plan_id === ignorerPlanId) return false;

        return seChevauchent({ debut: existant.plan_heure_debut, fin: existant.plan_heure_fin }, plageNouveau);
    });
};