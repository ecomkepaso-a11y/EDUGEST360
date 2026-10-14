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

// La réinscription crée un dossier distinct pour une nouvelle année scolaire.
export const reinscriptionSchema = Joi.object({
    mat_eleve: Joi.string().max(50).required().messages({
        "string.empty": "Le matricule élève est obligatoire.",
        "any.required": "Le matricule élève est obligatoire.",
    }),
    code_annee_scolaire: Joi.string().max(20).required().messages({
        "string.empty": "L'année scolaire cible est obligatoire.",
        "any.required": "L'année scolaire cible est obligatoire.",
    }),
    code_classe: Joi.string().max(50).required().messages({
        "string.empty": "La classe cible est obligatoire.",
        "any.required": "La classe cible est obligatoire.",
    }),
    date_inscription: Joi.date().iso().optional().messages({
        "date.base": "La date d'inscription doit être une date valide au format YYYY-MM-DD.",
    }),
});

export const markPieceAsFournieSchema = Joi.object({
    date_depot: Joi.date().iso().optional().allow(null).messages({
        "date.base": "La date de dépôt doit être au format YYYY-MM-DD.",
    }),
});

export const refuserInscriptionSchema = Joi.object({
    motif_refus: Joi.string().trim().min(3).max(500).required().messages({
        "string.empty": "Le motif du refus est obligatoire.",
        "string.min": "Le motif du refus doit contenir au moins 3 caractères.",
        "string.max": "Le motif du refus ne doit pas dépasser 500 caractères.",
        "any.required": "Le motif du refus est obligatoire.",
    }),
});