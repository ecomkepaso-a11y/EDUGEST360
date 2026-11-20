import { createMatiere, habiliterEnseignant } from "../services/matiere.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const matiere = await createMatiere(req.body);
        return successResponse(res, matiere, "Matière créée avec succès", 201);
    } catch (error) {
        next(error);
    }
};

export const habiliter = async (req, res, next) => {
    try {
        const matiere_id = Number(req.params.id);
        const enseignant_id = Number(req.params.ens_id);

        if (!Number.isInteger(matiere_id) || matiere_id < 1 || !Number.isInteger(enseignant_id) || enseignant_id < 1) {
            return errorResponse(res, "Paramètres invalides : id de la matière et id de l'enseignant doivent être des entiers positifs.", 400);
        }

        const { created, habilitation } = await habiliterEnseignant(matiere_id, enseignant_id, req.user);

        return successResponse(
            res,
            habilitation,
            created ? "Enseignant habilité à cette matière" : "Cet enseignant était déjà habilité à cette matière",
            created ? 201 : 200
        );
    } catch (error) {
        next(error);
    }
};