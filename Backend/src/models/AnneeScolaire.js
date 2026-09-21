import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const AnneeScolaire = sequelize.define(
    "AnneeScolaire",
    {
        code_annee_scolaire: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },

        date_debut_annee: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        date_fin_annee: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        eta_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
    },
    {
        tableName: "annee_scolaire",
        timestamps: false,
    }
);

export default AnneeScolaire;