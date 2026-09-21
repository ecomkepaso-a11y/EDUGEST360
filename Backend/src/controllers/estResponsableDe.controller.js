import {
    createResponsabilite,
    getAllResponsabilites,
    getResponsablesByEleve,
    getElevesByParent,
    updateResponsabilite,
    deleteResponsabilite,
} from "../services/estResponsableDe.service.js";

import { successResponse } from "../utils/response.js";


/**
 * Create a parent/student relationship.
 */
export const create = async (req, res, next) => {
    try {
        const responsabilite = await createResponsabilite(
            req.body
        );

        return successResponse(
            res,
            responsabilite,
            "Relation parent/élève créée avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all relationships.
 */
export const getAll = async (req, res, next) => {
    try {
        const responsabilites = await getAllResponsabilites();

        return successResponse(
            res,
            responsabilites,
            "Relations récupérées avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all responsible parents for a student.
 */
export const getByEleve = async (req, res, next) => {
    try {
        const { mat_eleve } = req.params;

        const responsables = await getResponsablesByEleve(
            mat_eleve
        );

        return successResponse(
            res,
            responsables,
            "Responsables de l'élève récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all students linked to a parent.
 */
export const getByParent = async (req, res, next) => {
    try {
        const { com_id } = req.params;

        const eleves = await getElevesByParent(com_id);

        return successResponse(
            res,
            eleves,
            "Élèves du parent/tuteur récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update the relationship.
 */
export const update = async (req, res, next) => {
    try {
        const { mat_eleve, com_id } = req.params;

        const responsabilite = await updateResponsabilite(
            mat_eleve,
            com_id,
            req.body
        );

        return successResponse(
            res,
            responsabilite,
            "Relation parent/élève modifiée avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Delete the relationship.
 */
export const remove = async (req, res, next) => {
    try {
        const { mat_eleve, com_id } = req.params;

        await deleteResponsabilite(
            mat_eleve,
            com_id
        );

        return successResponse(
            res,
            null,
            "Relation parent/élève supprimée avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};