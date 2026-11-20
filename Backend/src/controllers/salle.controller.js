import { createSalle, getSalles, updateSalle } from "../services/salle.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const salle = await createSalle(req.body, req.user);
        return successResponse(res, salle, "Salle créée avec succès", 201);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const salles = await getSalles(req.query, req.user);
        return successResponse(res, salles, "Salles récupérées avec succès");
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return errorResponse(res, "Paramètre invalide : id doit être un entier positif.", 400);
        }

        const salle = await updateSalle(id, req.body, req.user);
        return successResponse(res, salle, "Salle modifiée avec succès");
    } catch (error) {
        next(error);
    }
};