import Joi from "joi";

export const createBaremeFraisSchema = Joi.object({
    code_annee_scolaire: Joi.string().max(20).required(),
    code_niveau: Joi.string().max(20).required(),
    code_filiere: Joi.string().max(20).allow(null).optional().default(null),
    montant: Joi.number().precision(2).min(0).required(),
}).messages({
    "any.required": "Le champ {{#label}} est obligatoire.",
    "number.min": "Le montant doit être positif ou nul.",
});
