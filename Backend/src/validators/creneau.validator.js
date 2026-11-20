import Joi from "joi";
import { heureEnSecondes } from "../utils/chevauchement.js";

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const heure = Joi.string()
    .trim()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .messages({
        "string.pattern.base": "L'heure doit être au format HH:MM ou HH:MM:SS (de 00:00 à 23:59).",
        "string.empty": "L'heure est obligatoire.",
    });

const idPositif = (label) =>
    Joi.number().integer().min(1).messages({
        "number.base": `${label} doit être un nombre.`,
        "number.integer": `${label} doit être un entier.`,
        "number.min": `${label} doit être un entier positif.`,
        "any.required": `${label} est obligatoire.`,
    });

// Champs communs à la création (tous obligatoires) et à la modification (tous facultatifs).
// RG-PLAN-01 : un créneau associe une classe, une matière, un enseignant, une salle et une plage horaire.
const champs = {
    code_classe: Joi.string().trim().min(1).max(50).messages({
        "string.empty": "Le code de la classe est obligatoire.",
        "any.required": "Le code de la classe est obligatoire.",
    }),
    matiere_id: idPositif("L'identifiant de la matière"),
    enseignant_id: idPositif("L'identifiant de l'enseignant"),
    salle_id: idPositif("L'identifiant de la salle"),

    // "Lundi" ou " lundi " sont acceptés et normalisés en "lundi".
    plan_jour: Joi.string()
        .trim()
        .lowercase()
        .valid(...JOURS)
        .messages({
            "any.only": `Le jour doit être l'un de : ${JOURS.join(", ")}.`,
            "any.required": "Le jour est obligatoire.",
            "string.empty": "Le jour est obligatoire.",
        }),

    plan_heure_debut: heure.messages({ "any.required": "L'heure de début est obligatoire." }),
    plan_heure_fin: heure.messages({ "any.required": "L'heure de fin est obligatoire." }),
};

// Si les deux heures sont fournies, la fin doit être strictement après le début.
// (À la modification, si une seule heure est fournie, le service compare avec l'heure existante.)
const plageValide = (value, helpers) => {
    if (value.plan_heure_debut && value.plan_heure_fin) {
        if (heureEnSecondes(value.plan_heure_fin) <= heureEnSecondes(value.plan_heure_debut)) {
            return helpers.error("plage.invalide");
        }
    }
    return value;
};

export const createCreneauSchema = Joi.object(champs)
    .fork(Object.keys(champs), (champ) => champ.required())
    .custom(plageValide)
    .messages({ "plage.invalide": "L'heure de fin doit être strictement après l'heure de début." });

export const updateCreneauSchema = Joi.object(champs)
    .min(1)
    .custom(plageValide)
    .messages({
        "plage.invalide": "L'heure de fin doit être strictement après l'heure de début.",
        "object.min": "Fournissez au moins un champ à modifier.",
    });

// Simulation : mêmes champs que la création, plus un plan_id facultatif
// pour simuler la modification d'un créneau existant (il est exclu des conflits).
export const verifierCreneauSchema = createCreneauSchema.keys({
    plan_id: Joi.number().integer().min(1).messages({
        "number.base": "plan_id doit être un nombre.",
        "number.integer": "plan_id doit être un entier.",
        "number.min": "plan_id doit être un entier positif.",
    }),
});