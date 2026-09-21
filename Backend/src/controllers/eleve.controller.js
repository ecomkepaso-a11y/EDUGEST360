import {createEleve,getAllEleves,getEleveById,updateEleve,deleteEleve,attachUtilisateurToEleve,} from "../services/eleve.service.js";
import { successResponse } from "../utils/response.js";


/**
 * Create a student.
 */
export const create = async (req, res, next) => {
    try {
        const eleve = await createEleve(req.body);

        return successResponse(
            res,
            eleve,
            "eleve cree avec success",
            201
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get all students.
 */
export const getAll = async (req, res, next) => {
    try {
        const eleves = await getAllEleves();

        return successResponse(
            res,
            eleves,
            "eleves recuperer avec success",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Get one student.
 */
export const getOne = async (req, res, next) => {
    try {
        const { mat_eleve } = req.params;

        const eleve = await getEleveById(mat_eleve);

        return successResponse(
            res,
            eleve,
            "eleve recuperer avec success",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Update a student.
 */
export const update = async (req, res, next) => {
    try {
        const { mat_eleve } = req.params;

        const eleve = await updateEleve(
            mat_eleve,
            req.body
        );

        return successResponse(
            res,
            eleve,
            "eleve modifie avec success",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a student.
 */
export const remove = async (req, res, next) => {
    try {
        const { mat_eleve } = req.params;

        await deleteEleve(mat_eleve);

        return successResponse(
            res,
            null,
            "eleve supprime avec success",
            200
        );
    } catch (error) {
        next(error);
    }
};


/**
 * Attach an existing user account to a student.
 */
export const attachUtilisateur = async (req, res, next) => {
    try {
        const { mat_eleve } = req.params;
        const { usr_id } = req.body;

        const eleve = await attachUtilisateurToEleve(
            mat_eleve,
            usr_id
        );

        return successResponse(
            res,
            eleve,
            "Compte utilisateur rattaché à l'eleve avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};