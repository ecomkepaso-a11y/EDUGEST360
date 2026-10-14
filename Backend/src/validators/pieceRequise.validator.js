import Joi from "joi";

export const createPieceRequiseSchema = Joi.object({
    piece_nom: Joi.string()
        .max(200)
        .required()
        .messages({
            "string.empty": "Le nom de la pièce est obligatoire.",
            "any.required": "Le nom de la pièce est obligatoire.",
            "string.max":
                "Le nom de la pièce ne doit pas dépasser 200 caractères.",
        }),

    piece_description: Joi.string()
        .max(500)
        .allow("", null)
        .optional()
        .messages({
            "string.max":
                "La description ne doit pas dépasser 500 caractères.",
        }),

    piece_quantite: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
            "number.base": "La quantité doit être un nombre.",
            "number.integer": "La quantité doit être un entier.",
            "number.min": "La quantité doit être au moins égale à 1.",
        }),

    piece_obligatoire: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            "boolean.base":
                "Le caractère obligatoire doit être true ou false.",
        }),

    piece_statut: Joi.string()
        .valid("active", "inactive")
        .optional()
        .default("active"),
});

export const updatePieceRequiseSchema = Joi.object({
    piece_nom: Joi.string()
        .max(200)
        .optional(),

    piece_description: Joi.string()
        .max(500)
        .allow("", null)
        .optional(),

    piece_quantite: Joi.number()
        .integer()
        .min(1)
        .optional(),

    piece_obligatoire: Joi.boolean()
        .optional(),

    piece_statut: Joi.string()
        .valid("active", "inactive")
        .optional(),
});