import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

// Clé primaire composite (matiere_id, enseignant_id).
const Enseign = sequelize.define(
    "Enseign",
    {
        matiere_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },

        enseignant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "enseign",
        timestamps: false,
    }
);

export default Enseign;