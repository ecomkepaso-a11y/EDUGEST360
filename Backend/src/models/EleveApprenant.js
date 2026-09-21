import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EleveApprenant = sequelize.define(
    "EleveApprenant",
    {
        mat_eleve: {
            type: DataTypes.STRING(50),
            allowNull: false,
            primaryKey: true,
        },

        usr_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
            unique: true,
        },

        nom_eleve: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        prenom_eleve: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        sexe_eleve: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },

        date_naiss: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        lieu_naiss: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        nationalite: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    },
    {
        tableName: "eleve_apprenant",
        timestamps: false,
    }
);

export default EleveApprenant;