import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Utilisateur = sequelize.define(
    "Utilisateur",
    {
        usr_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },

        usr_nom: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        usr_prenom: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        usr_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        usr_tel: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        usr_login: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        usr_mdp_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        usr_role: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },

        usr_statut: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "actif",
        },

        usr_date_creation: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        eta_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
        },
    },
    {
        tableName: "utilisateur",
        timestamps: false,
    }
);

export default Utilisateur;