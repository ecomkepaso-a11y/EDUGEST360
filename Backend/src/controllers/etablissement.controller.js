import {createEtablissement,getAllEtablissements,getEtablissementById,updateEtablissement,deleteEtablissement,} from "../services/etablissement.service.js";

import {successResponse,} from "../utils/response.js";


/*
 * ============================================================
 * CREER ETABLISSEMENT
 * POST /api/v1/etablissements
 * ============================================================
 */
export const create = async (req, res, next) => {
    try {
        const etablissement = await createEtablissement(req.body);

        return successResponse(
            res,
            etablissement,
            "Établissement créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};


/*
 * ============================================================
 * GET ALL ETABLISSEMENTS
 * GET /api/v1/etablissements
 * ============================================================
 */
export const getAll = async (req, res, next) => {
    try {
        const etablissements = await getAllEtablissements();

        return successResponse(
            res,
            etablissements,
            "Établissements récupérés avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/*
 * ============================================================
 * GET ONE ETABLISSEMENT
 * GET /api/v1/etablissements/:eta_id
 * ============================================================
 */
export const getOne = async (req, res, next) => {
    try {
        const { eta_id } = req.params;

        const etablissement = await getEtablissementById(eta_id);

        return successResponse(
            res,
            etablissement,
            "Établissement récupéré avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/*
 * ============================================================
 * UPDATE ETABLISSEMENT
 * PUT /api/v1/etablissements/:eta_id
 * ============================================================
 */
export const update = async (req, res, next) => {
    try {
        const { eta_id } = req.params;

        const etablissement = await updateEtablissement(
            eta_id,
            req.body
        );

        return successResponse(
            res,
            etablissement,
            "Établissement modifié avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};


/*
 * ============================================================
 * DELETE ETABLISSEMENT
 * DELETE /api/v1/etablissements/:eta_id
 * ============================================================
 */
export const remove = async (req, res, next) => {
    try {
        const { eta_id } = req.params;

        await deleteEtablissement(eta_id);

        return successResponse(
            res,
            null,
            "Établissement supprimé avec succès",
            200
        );
    } catch (error) {
        next(error);
    }
};