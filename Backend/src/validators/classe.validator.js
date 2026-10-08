import Joi from "joi";

export const createClasseSchema = Joi.object({
    code_classe: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.empty": "Le code de la classe est obligatoire.",
            "any.required": "Le code de la classe est obligatoire.",
            "string.max":
                "Le code de la classe ne doit pas dépasser 50 caractères.",
        }),

    libelle_classe: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.empty": "Le libellé de la classe est obligatoire.",
            "any.required": "Le libellé de la classe est obligatoire.",
            "string.max":
                "Le libellé de la classe ne doit pas dépasser 100 caractères.",
        }),

    effectif_classe: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "L'effectif doit être un nombre.",
            "number.integer": "L'effectif doit être un entier.",
            "number.min": "L'effectif ne peut pas être négatif.",
            "any.required": "L'effectif est obligatoire.",
        }),

    // Capacité maximale autorisée pour la classe
    effectif_max: Joi.number()
        .integer()
        .min(0)
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "L'effectif maximal doit être un nombre.",
            "number.integer":
                "L'effectif maximal doit être un entier.",
            "number.min":
                "L'effectif maximal ne peut pas être négatif.",
        }),

    statut_classe: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            "boolean.base":
                "Le statut de la classe doit être true ou false.",
        }),

    eta_id: Joi.string()
        .max(36)
        .required()
        .messages({
            "string.empty": "L'établissement est obligatoire.",
            "any.required": "L'établissement est obligatoire.",
        }),

    code_annee_scolaire: Joi.string()
        .max(20)
        .required()
        .messages({
            "string.empty": "L'année scolaire est obligatoire.",
            "any.required": "L'année scolaire est obligatoire.",
        }),

    code_niveau: Joi.string()
        .max(20)
        .required()
        .messages({
            "string.empty": "Le niveau est obligatoire.",
            "any.required": "Le niveau est obligatoire.",
        }),

    code_filiere: Joi.string()
        .max(20)
        .allow(null, "")
        .optional(),
});