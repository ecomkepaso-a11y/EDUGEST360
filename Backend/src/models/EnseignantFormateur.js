import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EnseignantFormateur = sequelize.define(
    "EnseignantFormateur",
    {
        enseignant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },

        usr_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
            unique: true,
        },

        enseignant_specialite: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        enseignant_statut: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "enseignant_formateur",
        timestamps: false,
    }
);

export default EnseignantFormateur;