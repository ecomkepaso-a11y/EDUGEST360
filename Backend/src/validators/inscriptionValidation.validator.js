import Joi from "joi";

export const validerInscriptionSchema = Joi.object({
    fin_date_echeance: Joi.date()
        .iso()
        .required()
        .messages({
            "any.required": "La date d'échéance est obligatoire",
            "date.base": "La date d'échéance doit être une date valide",
            "date.format": "La date d'échéance doit être au format YYYY-MM-DD",
        }),
});