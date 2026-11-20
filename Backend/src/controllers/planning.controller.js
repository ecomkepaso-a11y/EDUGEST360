import { planningClasse, planningEnseignant, planningEleve, planningSalle, sallesLibres } from "../services/planning.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

const lireId = (valeur) => {
    const id = Number(valeur);
    return Number.isInteger(id) && id >= 1 ? id : null;
};

export const classe = async (req, res, next) => {
    try {
        return successResponse(res, await planningClasse(req.params.code_classe, req.user), "Planning de la classe");
    } catch (e) { next(e); }
};

export const enseignant = async (req, res, next) => {
    try {
        const id = lireId(req.params.id);
        if (id === null) return errorResponse(res, "Paramètre invalide : id doit être un entier positif.", 400);
        const { du, au } = req.validatedQuery ?? {};
        const periode = du && au ? { du, au } : null;
        return successResponse(res, await planningEnseignant(id, req.user, periode), "Planning de l'enseignant");
    } catch (e) { next(e); }
};

export const eleve = async (req, res, next) => {
    try {
        return successResponse(res, await planningEleve(req.params.mat_eleve, req.user), "Planning de l'élève");
    } catch (e) { next(e); }
};

export const salle = async (req, res, next) => {
    try {
        const id = lireId(req.params.id);
        if (id === null) return errorResponse(res, "Paramètre invalide : id doit être un entier positif.", 400);
        return successResponse(res, await planningSalle(id, req.user), "Planning de la salle");
    } catch (e) { next(e); }
};

export const libres = async (req, res, next) => {
    try {
        const q = req.validatedQuery;
        const eta_id = req.user.eta_id ?? q.eta_id;
        if (!eta_id) return errorResponse(res, "eta_id est obligatoire pour un compte sans établissement.", 400);

        const normaliser = (h) => (h.length === 5 ? `${h}:00` : h);
        const data = await sallesLibres(
            { eta_id, jour: q.jour, debut: normaliser(q.debut), fin: normaliser(q.fin), capacite_min: q.capacite_min ?? null },
            req.user
        );
        return successResponse(res, data, `${data.total} salle(s) libre(s)`);
    } catch (e) { next(e); }
};