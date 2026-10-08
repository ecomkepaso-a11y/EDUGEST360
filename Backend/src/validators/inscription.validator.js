import Joi from "joi";

export const createInscriptionSchema = Joi.object({
    mat_eleve: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.empty": "L'élève est obligatoire.",
            "any.required": "L'élève est obligatoire.",
            "string.max":
                "Le matricule élève ne doit pas dépasser 50 caractères.",
        }),

    date_inscription: Joi.date()
        .iso()
        .required()
        .messages({
            "date.format":
                "La date d'inscription doit être au format YYYY-MM-DD.",
            "any.required": "La date d'inscription est obligatoire.",
        }),

    statut_inscription: Joi.string()
        .max(20)
        .optional()
        .default("en_attente"),

    code_annee_scolaire: Joi.string()
        .max(20)
        .required()
        .messages({
            "string.empty": "L'année scolaire est obligatoire.",
            "any.required": "L'année scolaire est obligatoire.",
        }),

    code_classe: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.empty": "La classe est obligatoire.",
            "any.required": "La classe est obligatoire.",
        }),

    fact_id: Joi.number()
        .integer()
        .allow(null)
        .optional(),
});