import Joi from "joi";
import { heureEnSecondes } from "../utils/chevauchement.js";
import { parseDate, nombreDeJours } from "../utils/conges.js";

const dateIso = Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((valeur, helpers) => {
        try {
            parseDate(valeur);
            return valeur;
        } catch {
            return helpers.error("date.invalide");
        }
    })
    .messages({
        "string.pattern.base": "La date doit être au format AAAA-MM-JJ.",
        "date.invalide": "Cette date n'existe pas.",
    });

export const periodeQuerySchema = Joi.object({ du: dateIso, au: dateIso })
    .and("du", "au")
    .custom((v, helpers) => {
        if (!v.du) return v;
        if (v.au < v.du) return helpers.error("periode.ordre");
        if (nombreDeJours(v.du, v.au) > 366) return helpers.error("periode.longue");
        return v;
    })
    .messages({
        "object.and": "Les paramètres du et au vont ensemble : fournissez les deux ou aucun.",
        "periode.ordre": "La date « au » doit être égale ou postérieure à « du ».",
        "periode.longue": "La période ne peut pas dépasser 366 jours.",
    });

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const heure = Joi.string()
    .trim()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .required()
    .messages({ "string.pattern.base": "L'heure doit être au format HH:MM ou HH:MM:SS." });

export const sallesLibresQuerySchema = Joi.object({
    jour: Joi.string().trim().lowercase().valid(...JOURS).required().messages({
        "any.only": `Le jour doit être l'un de : ${JOURS.join(", ")}.`,
        "any.required": "Le jour est obligatoire.",
    }),
    debut: heure,
    fin: heure,
    capacite_min: Joi.number().integer().min(1),
    eta_id: Joi.string().trim().max(36), // seulement pour un compte sans établissement
}).custom((v, helpers) =>
    heureEnSecondes(v.fin) <= heureEnSecondes(v.debut) ? helpers.error("plage.invalide") : v
).messages({ "plage.invalide": "L'heure de fin doit être strictement après l'heure de début." });


export const validateQuery = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors: error.details.map((d) => ({ field: d.path.join("."), message: d.message })),
        });
    }
    req.validatedQuery = value;
    next();
};