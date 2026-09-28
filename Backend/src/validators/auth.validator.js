import Joi from "joi";

export const loginSchema = Joi.object({
    login: Joi.string()
        .required()
        .messages({
            "string.empty": "Le login est obligatoire",
            "any.required": "Le login est obligatoire",
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Le mot de passe est obligatoire",
            "any.required": "Le mot de passe est obligatoire",
        }),
});