import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Inscription = sequelize.define(
    "Inscription",
    {
        ins_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        mat_eleve: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        date_inscription: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        statut_inscription: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "en_attente",
        },

        code_annee_scolaire: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        code_classe: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        fact_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
    },
    {
        tableName: "inscription",
        timestamps: false,
    }
);

export default Inscription;