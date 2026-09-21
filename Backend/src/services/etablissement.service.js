import { Etablissement } from "../models/index.js";

/*
 * ============================================================
 * POST
 * ============================================================
 */
export const createEtablissement = async (data) => {
    try {
        const etablissement = await Etablissement.create(data);

        return etablissement;
    } catch (error) {
        // MySQL duplicate entry
        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors?.map((err) => err.path).join(", ");

            const conflictError = new Error(
                `Un etablissement avec cette valeur existe deja (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/*
 * ============================================================
 * GET ALL
 * ============================================================
 */
export const getAllEtablissements = async () => {
    return await Etablissement.findAll({
        order: [["eta_nom", "ASC"]],
    });
};


/*
 * ============================================================
 * GET ONE
 * ============================================================
 */
export const getEtablissementById = async (eta_id) => {
    const etablissement = await Etablissement.findByPk(eta_id);

    if (!etablissement) {
        const error = new Error(
            `Etablissement introuvable avec l'identifiant : ${eta_id}`
        );

        error.status = 404;
        throw error;
    }

    return etablissement;
};


/*
 * ============================================================
 * UPDATE
 * ============================================================
 */
export const updateEtablissement = async (eta_id, data) => {
    const etablissement = await Etablissement.findByPk(eta_id);

    if (!etablissement) {
        const error = new Error(
            `Etablissement introuvable avec l'identifiant : ${eta_id}`
        );

        error.status = 404;
        throw error;
    }

    try {
        await etablissement.update(data);

        return etablissement;
    } catch (error) {
        // MySQL duplicate entry
        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors?.map((err) => err.path).join(", ");

            const conflictError = new Error(
                `Impossible de modifier l'etablissement : une valeur existe deja (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/*
 * ============================================================
 * DELETE
 * ============================================================
 */
export const deleteEtablissement = async (eta_id) => {
    const etablissement = await Etablissement.findByPk(eta_id);

    if (!etablissement) {
        const error = new Error(
            `etablissement introuvable avec l'identifiant : ${eta_id}`
        );

        error.status = 404;
        throw error;
    }

    await etablissement.destroy();

    return etablissement;
};