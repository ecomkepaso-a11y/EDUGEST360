import { PieceRequise } from "../models/index.js";

export const createPieceRequise = async (data) => {
    try {
        return await PieceRequise.create(data);
    } catch (error) {
        throw error;
    }
};

export const getPiecesRequises = async () => {
    return await PieceRequise.findAll({
        order: [
            ["piece_obligatoire", "DESC"],
            ["piece_id", "ASC"],
        ],
    });
};

export const getPieceRequiseById = async (piece_id) => {
    const piece = await PieceRequise.findByPk(piece_id);

    if (!piece) {
        const error = new Error(
            `Pièce requise introuvable : ${piece_id}`
        );

        error.status = 404;
        throw error;
    }

    return piece;
};

export const updatePieceRequise = async (piece_id, data) => {
    const piece = await getPieceRequiseById(piece_id);

    await piece.update(data);

    return piece;
};

export const deletePieceRequise = async (piece_id) => {
    const piece = await getPieceRequiseById(piece_id);

    /*
     * Ca garde l'historique des pieces requiese 
     */
    await piece.update({
        piece_statut: "inactive",
    });

    return piece;
};