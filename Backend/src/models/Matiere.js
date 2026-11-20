import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Matiere = sequelize.define(
    "Matiere",
    {
        matiere_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },

        matiere_code: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },

        matiere_libelle: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        matiere_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "matiere",
        timestamps: false,
    }
);

export default Matiere;