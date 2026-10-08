import {createInscription,getInscriptionById,getInscriptions,markPieceAsFournie,} from "../services/inscription.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const inscription =
            await createInscription(req.body);

        return successResponse(
            res,
            inscription,
            "Dossier d'inscription créé avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const result =
            await getInscriptions({
                mat_eleve: req.query.mat_eleve,
                code_annee_scolaire:
                    req.query.code_annee_scolaire,
                code_classe: req.query.code_classe,
                statut_inscription:
                    req.query.statut_inscription,
                page: req.query.page,
                limit: req.query.limit,
            });

        return successResponse(
            res,
            result,
            "Inscriptions récupérées avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const inscription =
            await getInscriptionById(
                Number(req.params.ins_id)
            );

        return successResponse(
            res,
            inscription,
            "Inscription récupérée avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const markPiece = async (
    req,
    res,
    next
) => {
    try {
        const necessite =
            await markPieceAsFournie(
                Number(req.params.ins_id),
                Number(req.params.piece_id),
                req.body.date_depot
            );

        return successResponse(
            res,
            necessite,
            "Pièce marquée comme fournie avec succès"
        );
    } catch (error) {
        next(error);
    }
};