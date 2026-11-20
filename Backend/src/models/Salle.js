import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

// Salle d'un établissement. Le nom est unique PAR établissement (eta_id, salle_nom).
const Salle = sequelize.define(
    "Salle",
    {
        salle_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },

        salle_nom: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        eta_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },

        // NULL = capacité non renseignée (RG-PLAN-08 non appliquée dans ce cas)
        capacite: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
    },
    {
        tableName: "salle",
        timestamps: false,
    }
);

export default Salle;