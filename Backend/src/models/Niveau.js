import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Niveau = sequelize.define(
    "Niveau",
    {
        code_niveau: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },

        libelle_niveau: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: "niveau",
        timestamps: false,
    }
);

export default Niveau;