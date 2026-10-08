import {
    createClasse,
    getClasses,
    getClasseById,
    updateClasse,
    deleteClasse,
} from "../services/classe.service.js";

import { successResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const classe = await createClasse(req.body);

        return successResponse(
            res,
            classe,
            "Classe créée avec succès",
            201
        );
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const classes = await getClasses(
            {
                annee_scolaire: req.query.annee_scolaire,
                niveau: req.query.niveau,
            },
            req.user
        );

        return successResponse(
            res,
            classes,
            "Classes récupérées avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const classe = await getClasseById(
            req.params.code_classe,
            req.user
        );

        return successResponse(
            res,
            classe,
            "Classe récupérée avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const classe = await updateClasse(
            req.params.code_classe,
            req.body
        );

        return successResponse(
            res,
            classe,
            "Classe modifiée avec succès"
        );
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const classe = await deleteClasse(
            req.params.code_classe
        );

        return successResponse(
            res,
            classe,
            "Classe désactivée avec succès"
        );
    } catch (error) {
        next(error);
    }
};