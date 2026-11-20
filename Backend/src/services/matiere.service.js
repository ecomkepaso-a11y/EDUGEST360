import { Matiere, Enseign, EnseignantFormateur, Utilisateur } from "../models/index.js";

const isDuplicate = (error) =>
    error.name === "SequelizeUniqueConstraintError" || error.original?.errno === 1062;

export const createMatiere = async (data) => {
    try {
        return await Matiere.create({
            matiere_code: data.matiere_code,
            matiere_libelle: data.matiere_libelle,
            matiere_description: data.matiere_description || null,
        });
    } catch (error) {
        if (isDuplicate(error)) {
            const err = new Error(`Une matière avec le code ${data.matiere_code} existe déjà.`);
            err.status = 409;
            throw err;
        }
        throw error;
    }
};

/*
 * Habilite un enseignant à enseigner une matière
 * Idempotent : si l'habilitation existe déjà, created = false, sans erreur.
 */
export const habiliterEnseignant = async (matiere_id, enseignant_id, currentUser) => {
    const matiere = await Matiere.findByPk(matiere_id);

    if (!matiere) {
        const error = new Error(`Matière introuvable : ${matiere_id}`);
        error.status = 404;
        throw error;
    }

    const enseignant = await EnseignantFormateur.findByPk(enseignant_id, {
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["usr_id", "eta_id"] }],
    });

    if (!enseignant) {
        const error = new Error(`Enseignant introuvable : ${enseignant_id}`);
        error.status = 404;
        throw error;
    }

    if (!enseignant.enseignant_statut) {
        const error = new Error("Cet enseignant est inactif et ne peut pas être habilité.");
        error.status = 409;
        throw error;
    }

    // on n'habilite pas l'enseignant d'un autre établissement.
    const etaEnseignant = enseignant.utilisateur?.eta_id;

    if (currentUser?.eta_id && etaEnseignant && etaEnseignant !== currentUser.eta_id) {
        const error = new Error("Accès refusé : cet enseignant appartient à un autre établissement.");
        error.status = 403;
        throw error;
    }

    const [habilitation, created] = await Enseign.findOrCreate({
        where: { matiere_id, enseignant_id },
        defaults: { matiere_id, enseignant_id },
    });

    return {
        created,
        habilitation: {
            matiere_id: habilitation.matiere_id,
            matiere_code: matiere.matiere_code,
            enseignant_id: habilitation.enseignant_id,
        },
    };
};