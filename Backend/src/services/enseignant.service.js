import {EnseignantFormateur,Utilisateur,} from "../models/index.js";
/**
 * Create an enseignant/formateur.
 */
export const createEnseignant = async (data) => {
    try {
        return await EnseignantFormateur.create(data);

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un enseignant."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * GET ALL enseignants.
 */
export const getAllEnseignants = async () => {
    return await EnseignantFormateur.findAll({
        order: [["enseignant_id", "ASC"]],
    });
};


/**
 * GET ONE enseignant.
 */
export const getEnseignantById = async (enseignant_id) => {
    const enseignant = await EnseignantFormateur.findByPk(
        enseignant_id
    );

    if (!enseignant) {
        const error = new Error(
            `Enseignant introuvable avec l'identifiant : ${enseignant_id}`
        );

        error.status = 404;
        throw error;
    }

    return enseignant;
};


/**
 * UPDATE an enseignant.
 */
export const updateEnseignant = async (
    enseignant_id,
    data
) => {
    const enseignant = await EnseignantFormateur.findByPk(
        enseignant_id
    );

    if (!enseignant) {
        const error = new Error(
            `Enseignant introuvable avec l'identifiant : ${enseignant_id}`
        );

        error.status = 404;
        throw error;
    }

    try {
        await enseignant.update(data);
        return enseignant;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un autre enseignant."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * DELETE an enseignant.
 */
export const deleteEnseignant = async (enseignant_id) => {
    const enseignant = await EnseignantFormateur.findByPk(
        enseignant_id
    );

    if (!enseignant) {
        const error = new Error(
            `Enseignant introuvable avec l'identifiant : ${enseignant_id}`
        );

        error.status = 404;
        throw error;
    }

    await enseignant.destroy();

    return enseignant;
};


/**
 * Attach an existing user account to an enseignant.
 */
export const attachUtilisateurToEnseignant = async (
    enseignant_id,
    usr_id
) => {

    const enseignant = await EnseignantFormateur.findByPk(
        enseignant_id
    );

    if (!enseignant) {
        const error = new Error(
            `Enseignant introuvable avec l'identifiant : ${enseignant_id}`
        );

        error.status = 404;
        throw error;
    }

    const utilisateur = await Utilisateur.findByPk(usr_id);

    if (!utilisateur) {
        const error = new Error(
            `Utilisateur introuvable avec l'identifiant : ${usr_id}`
        );

        error.status = 404;
        throw error;
    }

    if (enseignant.usr_id) {
        const error = new Error(
            "Cet enseignant possede deja un compte utilisateur."
        );

        error.status = 409;
        throw error;
    }

    try {
        await enseignant.update({
            usr_id,
        });

        return enseignant;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un autre enseignant."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};