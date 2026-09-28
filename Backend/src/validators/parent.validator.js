import Joi from "joi";

export const createParentSchema = Joi.object({
    com_id: Joi.string().max(36).allow(null),
    com_canal: Joi.string().max(20).required(),
    com_statut: Joi.string().max(20),
});