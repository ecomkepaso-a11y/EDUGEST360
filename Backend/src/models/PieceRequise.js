import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PieceRequise = sequelize.define(
    "PieceRequise",
    {
        piece_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        piece_nom: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },

        piece_description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        piece_quantite: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },

        piece_obligatoire: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        piece_statut: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "active",
        },
    },
    {
        tableName: "piece_requise",
        timestamps: false,
    }
);

export default PieceRequise;