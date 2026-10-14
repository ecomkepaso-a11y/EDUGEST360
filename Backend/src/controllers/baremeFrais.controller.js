import { createBaremeFrais } from "../services/baremeFrais.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const bareme = await createBaremeFrais(req.body);
        return successResponse(res, bareme, "Barème de frais créé avec succès", 201);
    } catch (error) {
        next(error);
    }
};
