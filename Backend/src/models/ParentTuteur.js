import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ParentTuteur = sequelize.define(
    "ParentTuteur",
    {
        com_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },

        com_canal: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        com_statut: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "actif",
        },
    },
    {
        tableName: "parent_tuteur",
        timestamps: false,
    }
);

export default ParentTuteur;