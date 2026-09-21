import {
    createEnseignant,
    getAllEnseignants,
    getEnseignantById,
    updateEnseignant,
    deleteEnseignant,
    attachUtilisateurToEnseignant,
} from "../services/enseignant.service.js";

import { successResponse } from "../utils/response.js";


/**
 * Create an enseignant/formateur.
 */
export const create = async (req, res, next) => {
    try {
        const enseignant = await createEnseignant(req.body);

        return successResponse(
            res,
            enseignant,
            "Enseignant créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all enseignants.
 */
export const getAll = async (req, res, next) => {
    try {
        const enseignants = await getAllEnseignants();

        return successResponse(
            res,
            enseignants,
            "Enseignants récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get one enseignant.
 */
export const getOne = async (req, res, next) => {
    try {
        const { enseignant_id } = req.params;

        const enseignant = await getEnseignantById(
            enseignant_id
        );

        return successResponse(
            res,
            enseignant,
            "Enseignant récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update an enseignant.
 */
export const update = async (req, res, next) => {
    try {
        const { enseignant_id } = req.params;

        const enseignant = await updateEnseignant(
            enseignant_id,
            req.body
        );

        return successResponse(
            res,
            enseignant,
            "Enseignant modifié avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Delete an enseignant.
 */
export const remove = async (req, res, next) => {
    try {
        const { enseignant_id } = req.params;

        await deleteEnseignant(enseignant_id);

        return successResponse(
            res,
            null,
            "Enseignant supprimé avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Attach an existing user account to an enseignant.
 */
export const attachUtilisateur = async (req, res, next) => {
    try {
        const { enseignant_id } = req.params;
        const { usr_id } = req.body;

        const enseignant = await attachUtilisateurToEnseignant(
            enseignant_id,
            usr_id
        );

        return successResponse(
            res,
            enseignant,
            "Compte utilisateur rattaché à l'enseignant avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};