import {createUtilisateur,getAllUtilisateurs,getUtilisateurById,updateUtilisateur,} from "../services/utilisateur.service.js";
import { successResponse } from "../utils/response.js";


/**
 * Create a user account.
 */
export const create = async (req, res, next) => {
    try {
        const utilisateur = await createUtilisateur(req.body);

        return successResponse(
            res,
            utilisateur,
            "Utilisateur créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all users.
 */
export const getAll = async (req, res, next) => {
    try {
        const utilisateurs = await getAllUtilisateurs();

        return successResponse(
            res,
            utilisateurs,
            "Utilisateurs récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get one user.
 */
export const getOne = async (req, res, next) => {
    try {
        const { usr_id } = req.params;

        const utilisateur = await getUtilisateurById(usr_id);

        return successResponse(
            res,
            utilisateur,
            "Utilisateur récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update a user.
 */
export const update = async (req, res, next) => {
    try {
        const { usr_id } = req.params;

        const utilisateur = await updateUtilisateur(
            usr_id,
            req.body
        );

        return successResponse(
            res,
            utilisateur,
            "Utilisateur modifié avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};