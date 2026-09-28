import { loginUtilisateur } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

export const login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        const result = await loginUtilisateur(login, password);

        return successResponse(
            res,
            result,
            "Connexion réussie",
            200
        );
    } catch (error) {
        next(error);
    }
};