import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Utilisateur } from "../models/index.js";

console.log("JWT SECRET LOADED:", process.env.JWT_SECRET);


export const loginUtilisateur = async (login, password) => {
    const utilisateur = await Utilisateur.findOne({
        where: {
            usr_login: login,
        },
    });

    if (!utilisateur) {
        const error = new Error("Identifiants invalides");
        error.status = 401;
        throw error;
    }

    const passwordCorrect = await bcrypt.compare(
        password,
        utilisateur.usr_mdp_hash
    );

    if (!passwordCorrect) {
        const error = new Error("Identifiants invalides");
        error.status = 401;
        throw error;
    }

    if (utilisateur.usr_statut !== "actif") {
        const error = new Error("Compte utilisateur inactif");
        error.status = 403;
        throw error;
    }

    const token = jwt.sign(
        {
            usr_id: utilisateur.usr_id,
            usr_login: utilisateur.usr_login,
            usr_role: utilisateur.usr_role,
            eta_id: utilisateur.eta_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h",
        }
    );

    return {
        token,
        utilisateur: {
            usr_id: utilisateur.usr_id,
            usr_nom: utilisateur.usr_nom,
            usr_prenom: utilisateur.usr_prenom,
            usr_email: utilisateur.usr_email,
            usr_login: utilisateur.usr_login,
            usr_role: utilisateur.usr_role,
            usr_statut: utilisateur.usr_statut,
            eta_id: utilisateur.eta_id,
        },
    };
};