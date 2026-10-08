import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Classe = sequelize.define(
    "Classe",
    {
        code_classe: {
            type: DataTypes.STRING(50),
            allowNull: false,
            primaryKey: true,
        },

        libelle_classe: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        // Effectif actuel de la classe
        effectif_classe: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        // Nombre maximum eleves autorisés dans la classe
        effectif_max: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        statut_classe: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        eta_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },

        code_annee_scolaire: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        code_niveau: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        code_filiere: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
    },
    {
        tableName: "classe",
        timestamps: false,
    }
);

export default Classe;