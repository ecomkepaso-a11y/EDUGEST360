import {Personnel,Utilisateur,} from "../models/index.js";
import { randomUUID } from "crypto";
/**
 * Create a personnel profile.
 */
export const createPersonnel = async (data) => {
    try {
        return await Personnel.create({
            rh_id: data.rh_id || randomUUID(),
            ...data,
        });

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Un personnel existe deja avec cette valeur (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Get all personnel.
 */
export const getAllPersonnels = async () => {
    return await Personnel.findAll({
        order: [["rh_matricule", "ASC"]],
    });
};


/**
 * Get one personnel.
 */
export const getPersonnelById = async (rh_id) => {
    const personnel = await Personnel.findByPk(rh_id);

    if (!personnel) {
        const error = new Error(
            `Personnel introuvable avec l'identifiant : ${rh_id}`
        );

        error.status = 404;
        throw error;
    }

    return personnel;
};


/**
 * Update a personnel profile.
 */
export const updatePersonnel = async (rh_id, data) => {
    const personnel = await Personnel.findByPk(rh_id);

    if (!personnel) {
        const error = new Error(
            `Personnel introuvable avec l'identifiant : ${rh_id}`
        );

        error.status = 404;
        throw error;
    }

    try {
        await personnel.update(data);
        return personnel;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Impossible de modifier le personnel : une valeur existe deja (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Delete a personnel profile.
 */
export const deletePersonnel = async (rh_id) => {
    const personnel = await Personnel.findByPk(rh_id);

    if (!personnel) {
        const error = new Error(
            `Personnel introuvable avec l'identifiant : ${rh_id}`
        );

        error.status = 404;
        throw error;
    }

    await personnel.destroy();

    return personnel;
};


/**
 * Attach an existing user account to a personnel profile.
 */
export const attachUtilisateurToPersonnel = async (
    rh_id,
    usr_id
) => {

    const personnel = await Personnel.findByPk(rh_id);

    if (!personnel) {
        const error = new Error(
            `Personnel introuvable avec l'identifiant : ${rh_id}`
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

    if (personnel.usr_id) {
        const error = new Error(
            "Ce personnel possède deja un compte utilisateur."
        );

        error.status = 409;
        throw error;
    }

    try {
        await personnel.update({
            usr_id,
        });

        return personnel;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un autre personnel."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};