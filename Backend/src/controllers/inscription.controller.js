import {createInscription,getInscriptionById,getInscriptions,markPieceAsFournie,refuserInscription,annulerInscription,reinscrireEleve} from "../services/inscription.service.js";
import { successResponse } from "../utils/response.js";
import {validerInscription,} from "../services/inscription.service.js";

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
                    req.query.annee || req.query.code_annee_scolaire,
                code_classe: req.query.classe || req.query.code_classe,
                statut_inscription:
                    req.query.statut || req.query.statut_inscription,
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
                Number(req.params.ins_id),
                req.user
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

// ============================================================
// VALIDER UNE INSCRIPTION
// ============================================================

export const validate = async (req, res, next) => {
    try {
        const { ins_id } = req.params;
        const { fin_date_echeance } = req.body;

        const result = await validerInscription(
            ins_id,
            fin_date_echeance
        );

        return res.status(200).json({
            success: true,
            message: "Inscription validée et échéance générée avec succès",
            data: result,
        });

    } catch (error) {
        next(error);
    }
};

export const refuse = async (req, res, next) => {
    try {
        const result = await refuserInscription(req.params.ins_id, req.body.motif_refus);

        return res.status(200).json({
            success: true,
            message: "Inscription refusée",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


export const cancel = async (req, res, next) => {
    try {
        const result = await annulerInscription(req.params.ins_id);

        return res.status(200).json({
            success: true,
            message: "Inscription annulée",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Créer un nouveau dossier pour un élève déjà inscrit lors d'une année précédente.
export const reinscription = async (req, res, next) => {
    try {
        const dossier = await reinscrireEleve(req.body);
        return successResponse(
            res,
            dossier,
            "Réinscription créée avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};