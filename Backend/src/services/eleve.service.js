import { EleveApprenant, Utilisateur } from "../models/index.js";
import { randomUUID } from "crypto";


/**
 * Create a student.
 *
 * can initially exist without a user account.
 */
export const createEleve = async (data) => {
    try {
        const eleve = await EleveApprenant.create({
            mat_eleve: data.mat_eleve || randomUUID(),
            ...data,
        });

        return eleve;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Un eleve existe deja avec cette valeur (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Get all students.
 */
export const getAllEleves = async () => {
    return await EleveApprenant.findAll({
        order: [["nom_eleve", "ASC"], ["prenom_eleve", "ASC"]],
    });
};


/**
 * Get one student.
 */
export const getEleveById = async (mat_eleve) => {
    const eleve = await EleveApprenant.findByPk(mat_eleve);

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${mat_eleve}`
        );

        error.status = 404;
        throw error;
    }

    return eleve;
};


/**
 * Update a student.
 */
export const updateEleve = async (mat_eleve, data) => {
    const eleve = await EleveApprenant.findByPk(mat_eleve);

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${mat_eleve}`
        );

        error.status = 404;
        throw error;
    }

    try {
        await eleve.update(data);
        return eleve;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un autre eleve."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Delete a student.
 */
export const deleteEleve = async (mat_eleve) => {
    const eleve = await EleveApprenant.findByPk(mat_eleve);

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${mat_eleve}`
        );

        error.status = 404;
        throw error;
    }

    await eleve.destroy();

    return eleve;
};


/**
 * Attach an existing user account to a student.
 */
export const attachUtilisateurToEleve = async (
    mat_eleve,
    usr_id
) => {

    const eleve = await EleveApprenant.findByPk(mat_eleve);

    if (!eleve) {
        const error = new Error(
            `eleve introuvable avec le matricule : ${mat_eleve}`
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

    if (eleve.usr_id) {
        const error = new Error(
            "Cet eleve possede deja un compte utilisateur."
        );

        error.status = 409;
        throw error;
    }

    try {
        await eleve.update({
            usr_id,
        });

        return eleve;

    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                "Ce compte utilisateur est deja rattache a un autre eleve."
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};