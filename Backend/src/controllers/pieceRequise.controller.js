import {createPieceRequise,getPiecesRequises,getPieceRequiseById,updatePieceRequise,deletePieceRequise} from "../services/pieceRequise.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const piece = await createPieceRequise(req.body);

        return successResponse(
            res,
            piece,
            "Pièce requise créée avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const pieces = await getPiecesRequises();

        return successResponse(
            res,
            pieces,
            "Pieces requises recuperer avec success"
        );
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const piece = await getPieceRequiseById(
            Number(req.params.piece_id)
        );

        return successResponse(
            res,
            piece,
            "Piece recuperer avec success"
        );
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const piece = await updatePieceRequise(
            Number(req.params.piece_id),
            req.body
        );

        return successResponse(
            res,
            piece,
            "Pièce requise modifiée avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const piece = await deletePieceRequise(
            Number(req.params.piece_id)
        );

        return successResponse(
            res,
            piece,
            "Pièce requise désactivée avec succès"
        );
    } catch (error) {
        next(error);
    }
};