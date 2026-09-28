import Joi from "joi";

export const createEnseignantSchema = Joi.object({
    usr_id: Joi.string()
        .max(36)
        .allow(null)
        .optional()
        .messages({
            "string.max": "L'identifiant utilisateur ne doit pas dépasser 36 caractères.",
        }),

    enseignant_specialite: Joi.string()
        .max(150)
        .allow(null, "")
        .optional()
        .messages({
            "string.max": "La spécialité ne doit pas dépasser 150 caractères.",
        }),

    enseignant_statut: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            "boolean.base": "Le statut de l'enseignant doit être true ou false.",
        }),
});