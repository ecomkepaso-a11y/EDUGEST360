import Joi from "joi";

export const createResponsabiliteSchema = Joi.object({
    lien_parente: Joi.string()
        .max(30)
        .required()
        .messages({
            "string.empty": "Le lien de parenté est obligatoire.",
            "any.required": "Le lien de parenté est obligatoire.",
            "string.max": "Le lien de parenté ne doit pas dépasser 30 caractères.",
        }),
});