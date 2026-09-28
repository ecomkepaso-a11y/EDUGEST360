import Joi from "joi";

export const createPersonnelSchema = Joi.object({
    rh_id: Joi.string().max(36).allow(null),
    usr_id: Joi.string().max(36).allow(null),
    rh_matricule: Joi.string().max(50).required(),
    rh_fonction: Joi.string().max(100).required(),
    rh_date_embauche: Joi.date().iso().required(),
    rh_salaire_base: Joi.number().required(),
});