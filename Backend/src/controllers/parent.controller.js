import {
    createParent,
    getAllParents,
    getParentById,
    updateParent,
    deleteParent,
} from "../services/parent.service.js";

import { successResponse } from "../utils/response.js";


/**
 * Create a parent/tuteur.
 */
export const create = async (req, res, next) => {
    try {
        const parent = await createParent(req.body);

        return successResponse(
            res,
            parent,
            "Parent/tuteur créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all parents/tuteurs.
 */
export const getAll = async (req, res, next) => {
    try {
        const parents = await getAllParents();

        return successResponse(
            res,
            parents,
            "Parents/tuteurs récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get one parent/tuteur.
 */
export const getOne = async (req, res, next) => {
    try {
        const { com_id } = req.params;

        const parent = await getParentById(com_id);

        return successResponse(
            res,
            parent,
            "Parent/tuteur récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update a parent/tuteur.
 */
export const update = async (req, res, next) => {
    try {
        const { com_id } = req.params;

        const parent = await updateParent(
            com_id,
            req.body
        );

        return successResponse(
            res,
            parent,
            "Parent/tuteur modifié avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a parent/tuteur.
 */
export const remove = async (req, res, next) => {
    try {
        const { com_id } = req.params;

        await deleteParent(com_id);

        return successResponse(
            res,
            null,
            "Parent/tuteur supprimé avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};