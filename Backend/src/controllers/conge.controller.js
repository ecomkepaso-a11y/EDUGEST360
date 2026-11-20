import { creneauxImpactesParConge } from "../services/congeImpact.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const creneauxImpactes = async (req, res, next) => {
    try {
        const { conge_id } = req.params;
        if (!conge_id || conge_id.length > 36) return errorResponse(res, "Paramètre invalide : conge_id.", 400);

        const resultat = await creneauxImpactesParConge(conge_id, req.user);
        return successResponse(
            res,
            resultat,
            `${resultat.total} créneau(x) impacté(s)${resultat.impact_effectif ? "" : " (congé non validé : simple aperçu)"}`
        );
    } catch (e) { next(e); }
};