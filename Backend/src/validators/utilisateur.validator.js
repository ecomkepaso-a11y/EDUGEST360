import Joi from "joi";

export const createUtilisateurSchema = Joi.object({
    usr_nom: Joi.string().max(100).required(),
    usr_prenom: Joi.string().max(100).required(),
    usr_email: Joi.string().email().max(255).required(),
    usr_tel: Joi.string().max(20).allow("", null),
    usr_login: Joi.string().max(100).required(),
    password: Joi.string().min(6).required(),
    usr_role: Joi.string().max(30).required(),
    usr_statut: Joi.string().max(20),
    usr_date_creation: Joi.date().iso(),
    eta_id: Joi.string().max(36).allow(null)
});