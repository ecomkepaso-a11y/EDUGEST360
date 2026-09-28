import Joi from "joi";

export const createEleveSchema = Joi.object({
    mat_eleve: Joi.string().max(50).required(),
    usr_id: Joi.string().max(36).allow(null),
    nom_eleve: Joi.string().max(100).required(),
    prenom_eleve: Joi.string().max(100).required(),
    sexe_eleve: Joi.string().max(10).required(),
    date_naiss: Joi.date().iso().required(),
    lieu_naiss: Joi.string().max(100).allow("", null),
    nationalite: Joi.string().max(100).allow("", null),
});