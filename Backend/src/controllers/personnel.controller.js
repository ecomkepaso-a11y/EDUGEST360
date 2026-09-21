import {
    createPersonnel,
    getAllPersonnels,
    getPersonnelById,
    updatePersonnel,
    deletePersonnel,
    attachUtilisateurToPersonnel,
} from "../services/personnel.service.js";

import { successResponse } from "../utils/response.js";


/**
 * Create a personnel profile.
 */
export const create = async (req, res, next) => {
    try {
        const personnel = await createPersonnel(req.body);

        return successResponse(
            res,
            personnel,
            "Personnel créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all personnel.
 */
export const getAll = async (req, res, next) => {
    try {
        const personnels = await getAllPersonnels();

        return successResponse(
            res,
            personnels,
            "Personnel récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get one personnel.
 */
export const getOne = async (req, res, next) => {
    try {
        const { rh_id } = req.params;

        const personnel = await getPersonnelById(rh_id);

        return successResponse(
            res,
            personnel,
            "Personnel récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update a personnel profile.
 */
export const update = async (req, res, next) => {
    try {
        const { rh_id } = req.params;

        const personnel = await updatePersonnel(
            rh_id,
            req.body
        );

        return successResponse(
            res,
            personnel,
            "Personnel modifié avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a personnel profile.
 */
export const remove = async (req, res, next) => {
    try {
        const { rh_id } = req.params;

        await deletePersonnel(rh_id);

        return successResponse(
            res,
            null,
            "Personnel supprimé avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Attach an existing user account to a personnel profile.
 */
export const attachUtilisateur = async (req, res, next) => {
    try {
        const { rh_id } = req.params;
        const { usr_id } = req.body;

        const personnel = await attachUtilisateurToPersonnel(
            rh_id,
            usr_id
        );

        return successResponse(
            res,
            personnel,
            "Compte utilisateur rattaché au personnel avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};