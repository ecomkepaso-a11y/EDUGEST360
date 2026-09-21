import {EstResponsableDe,EleveApprenant,ParentTuteur,} from "../models/index.js";
/**
 * Create a parent/student responsibility relationship.
 */
export const createResponsabilite = async (data) => {

    // Check that the student exists
    const eleve = await EleveApprenant.findByPk(
        data.mat_eleve
    );

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${data.mat_eleve}`
        );

        error.status = 404;
        throw error;
    }

    // Check that the parent exists
    const parent = await ParentTuteur.findByPk(
        data.com_id
    );

    if (!parent) {
        const error = new Error(
            `Parent/tuteur introuvable avec l'identifiant : ${data.com_id}`
        );

        error.status = 404;
        throw error;
    }

    try {
        return await EstResponsableDe.create(data);

    } catch (error) {

        // Composite primary key already exists
        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Cette relation entre le parent/tuteur et l'eleve existe deja."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * GET all responsibility relationships.
 */
export const getAllResponsabilites = async () => {
    return await EstResponsableDe.findAll({
        order: [
            ["mat_eleve", "ASC"],
            ["com_id", "ASC"],
        ],
    });
};


/**
 * GET all parents/tuteurs responsible for one student.
 */
export const getResponsablesByEleve = async (mat_eleve) => {

    const eleve = await EleveApprenant.findByPk(mat_eleve);

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${mat_eleve}`
        );

        error.status = 404;
        throw error;
    }

    return await EstResponsableDe.findAll({
        where: {
            mat_eleve,
        },
    });
};


/**
 * GET all students linked to one parent/tuteur.
 */
export const getElevesByParent = async (com_id) => {

    const parent = await ParentTuteur.findByPk(com_id);

    if (!parent) {
        const error = new Error(
            `Parent/tuteur introuvable avec l'identifiant : ${com_id}`
        );

        error.status = 404;
        throw error;
    }

    return await EstResponsableDe.findAll({
        where: {
            com_id,
        },
    });
};


/**
 * UPDATE the relationship.
 *
 * Relationships stay the same, so only lien_parente to be modified.
 */
export const updateResponsabilite = async (
    mat_eleve,
    com_id,
    data
) => {

    const responsabilite = await EstResponsableDe.findOne({
        where: {
            mat_eleve,
            com_id,
        },
    });

    if (!responsabilite) {
        const error = new Error(
            "Relation parent/leve introuvable."
        );

        error.status = 404;
        throw error;
    }

    await responsabilite.update(data);

    return responsabilite;
};


/**
 * DELETE a responsibility relationship.
 */
export const deleteResponsabilite = async (
    mat_eleve,
    com_id
) => {

    const responsabilite = await EstResponsableDe.findOne({
        where: {
            mat_eleve,
            com_id,
        },
    });

    if (!responsabilite) {
        const error = new Error(
            "Relation parent/eleve introvable."
        );

        error.status = 404;
        throw error;
    }

    await responsabilite.destroy();

    return responsabilite;
};