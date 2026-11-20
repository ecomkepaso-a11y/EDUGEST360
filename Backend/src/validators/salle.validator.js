import Joi from "joi";

const nom = Joi.string().trim().min(1).max(50).messages({
    "string.empty": "Le nom de la salle est obligatoire.",
    "string.max": "Le nom de la salle ne doit pas dépasser 50 caractères.",
});

const capacite = Joi.number().integer().min(1).allow(null).messages({
    "number.base": "La capacité doit être un nombre.",
    "number.integer": "La capacité doit être un entier.",
    "number.min": "La capacité doit être supérieure ou égale à 1.",
});

export const createSalleSchema = Joi.object({
    salle_nom: nom.required().messages({ "any.required": "Le nom de la salle est obligatoire." }),
    capacite: capacite.optional().default(null),
    eta_id: Joi.string().max(36).optional(),
});

export const updateSalleSchema = Joi.object({
    salle_nom: nom.optional(),
    capacite: capacite.optional(),
})
    .min(1)
    .messages({ "object.min": "Fournissez au moins un champ à modifier (salle_nom ou capacite)." });