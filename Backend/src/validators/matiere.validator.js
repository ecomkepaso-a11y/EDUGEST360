import Joi from "joi";

export const createMatiereSchema = Joi.object({
    matiere_code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9_-]+$/)
        .min(1)
        .max(30)
        .required()
        .messages({
            "string.empty": "Le code de la matière est obligatoire.",
            "string.pattern.base": "Le code ne peut contenir que des lettres, chiffres, tirets et underscores.",
            "string.max": "Le code de la matière ne doit pas dépasser 30 caractères.",
            "any.required": "Le code de la matière est obligatoire.",
        }),
    matiere_libelle: Joi.string().trim().min(1).max(150).required().messages({
        "string.empty": "Le libellé de la matière est obligatoire.",
        "string.max": "Le libellé ne doit pas dépasser 150 caractères.",
        "any.required": "Le libellé de la matière est obligatoire.",
    }),
    matiere_description: Joi.string().trim().max(255).allow("", null).optional().default(null).messages({
        "string.max": "La description ne doit pas dépasser 255 caractères.",
    }),
});