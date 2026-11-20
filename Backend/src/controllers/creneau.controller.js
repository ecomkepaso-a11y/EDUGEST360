import { createCreneau, modifierCreneau, annulerCreneau, simulerCreneau } from "../services/creneau.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

const lireId = (valeur) => {
    const id = Number(valeur);
    return Number.isInteger(id) && id >= 1 ? id : null;
};

export const create = async (req, res, next) => {
    try {
        const creneau = await createCreneau(req.body, req.user);
        return successResponse(res, creneau, "Créneau créé avec succès", 201);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const id = lireId(req.params.id);
        if (id === null) return errorResponse(res, "Paramètre invalide : id doit être un entier positif.", 400);

        const creneau = await modifierCreneau(id, req.body, req.user);
        return successResponse(res, creneau, "Créneau modifié avec succès");
    } catch (error) {
        next(error);
    }
};

export const annuler = async (req, res, next) => {
    try {
        const id = lireId(req.params.id);
        if (id === null) return errorResponse(res, "Paramètre invalide : id doit être un entier positif.", 400);

        const { creneau, dejaAnnule } = await annulerCreneau(id, req.user);
        return successResponse(res, creneau, dejaAnnule ? "Ce créneau était déjà annulé" : "Créneau annulé avec succès");
    } catch (error) {
        next(error);
    }
};

export const verifier = async (req, res, next) => {
    try {
        const resultat = await simulerCreneau(req.body, req.user);
        const total = resultat.problemes.length + resultat.conflits.length;

        return successResponse(
            res,
            resultat,
            resultat.valide ? "Le créneau est possible" : `Le créneau n'est pas possible (${total} problème${total > 1 ? "s" : ""})`
        );
    } catch (error) {
        next(error);
    }
};