import { ParentTuteur } from "../models/index.js";
import { randomUUID } from "crypto";
/**
 * Create a parent/tuteur profile.
 */
export const createParent = async (data) => {
    try {
        return await ParentTuteur.create({
            com_id: data.com_id || randomUUID(),
            ...data,
        });

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Un parent/tuteur existe deja avec cette valeur (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Get all parents/tuteurs.
 */
export const getAllParents = async () => {
    return await ParentTuteur.findAll({
        order: [["com_id", "ASC"]],
    });
};


/**
 * Get one parent/tuteur.
 */
export const getParentById = async (com_id) => {
    const parent = await ParentTuteur.findByPk(com_id);

    if (!parent) {
        const error = new Error(
            `Parent/tuteur introuvable avec l'identifiant : ${com_id}`
        );

        error.status = 404;
        throw error;
    }

    return parent;
};


/**
 * Update a parent/tuteur profile.
 */
export const updateParent = async (com_id, data) => {
    const parent = await ParentTuteur.findByPk(com_id);

    if (!parent) {
        const error = new Error(
            `Parent/tuteur introuvable avec l'identifiant : ${com_id}`
        );

        error.status = 404;
        throw error;
    }

    await parent.update(data);

    return parent;
};


/**
 * Delete a parent/tuteur profile.
 */
export const deleteParent = async (com_id) => {
    const parent = await ParentTuteur.findByPk(com_id);

    if (!parent) {
        const error = new Error(
            `Parent/tuteur introuvable avec l'identifiant : ${com_id}`
        );

        error.status = 404;
        throw error;
    }

    await parent.destroy();

    return parent;
};