import bcrypt from "bcrypt";
import { Utilisateur } from "../models/index.js";
import { randomUUID } from "crypto";

/**
 * Create a new user account.
 * Password is hashed using bycrypt
 */
export const createUtilisateur = async (data) => {
    try {
        // The API receives the password through "password".
        // It is never stored directly in the database.
        const { password, ...userData } = data;

        if (!password) {
            const error = new Error("Le mot de passe est obligatoire.");
            error.status = 400;
            throw error;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const utilisateur = await Utilisateur.create({
            usr_id: userData.usr_id || randomUUID(),
            ...userData,
            usr_mdp_hash: hashedPassword,
            usr_date_creation:
                userData.usr_date_creation ||
                new Date().toISOString().split("T")[0],
        });

        return utilisateur;

    } catch (error) {

        // Duplicate email or login
        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Un utilisateur existe deja avec cette valeur (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};


/**
 * Get all users.
 */
export const getAllUtilisateurs = async () => {
    return await Utilisateur.findAll({
        order: [["usr_nom", "ASC"], ["usr_prenom", "ASC"]],
    });
};


/**
 * Get one user by ID.
 */
export const getUtilisateurById = async (usr_id) => {
    const utilisateur = await Utilisateur.findByPk(usr_id);

    if (!utilisateur) {
        const error = new Error(
            `Utilisateur introuvable avec l'identifiant : ${usr_id}`
        );

        error.status = 404;
        throw error;
    }

    return utilisateur;
};


/**
 * Update a user.
 *
 * If a new password is provided, it is hashed again.
 */
export const updateUtilisateur = async (usr_id, data, currentUser) => {
    const utilisateur = await Utilisateur.findByPk(usr_id);

    if (!utilisateur) {
        const error = new Error(
            `Utilisateur introuvable avec l'identifiant : ${usr_id}`
        );
        error.status = 404;
        throw error;
    }

    const isSelf = currentUser.usr_id === usr_id;
    const isDirection = currentUser.usr_role === "direction";
    const isPersonnel = currentUser.usr_role === "personnel";

    // Si l'utilisateur modifie son propre compte,
    // seuls certains champs sont autorisés.
    if (isSelf && !isDirection && !isPersonnel) {
        const allowedFields = [
            "usr_nom",
            "usr_prenom",
            "usr_email",
            "usr_tel",
            "password",
        ];

        const unauthorizedFields = Object.keys(data).filter(
            (field) => !allowedFields.includes(field)
        );

        if (unauthorizedFields.length > 0) {
            const error = new Error(
                `Modification non autorisée des champs : ${unauthorizedFields.join(", ")}`
            );

            error.status = 403;
            throw error;
        }
    }

    try {
        const { password, ...userData } = data;

        if (password) {
            userData.usr_mdp_hash = await bcrypt.hash(password, 10);
        }

        await utilisateur.update(userData);

        return utilisateur;
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const fields = error.errors
                ?.map((err) => err.path)
                .join(", ");

            const conflictError = new Error(
                `Impossible de modifier l'utilisateur : une valeur existe déjà (${fields}).`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};