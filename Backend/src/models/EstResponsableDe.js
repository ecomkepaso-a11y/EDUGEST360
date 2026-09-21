import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EstResponsableDe = sequelize.define(
    "EstResponsableDe",
    {
        mat_eleve: {
            type: DataTypes.STRING(50),
            allowNull: false,
            primaryKey: true,
        },

        com_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },

        lien_parente: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    },
    {
        tableName: "est_responsable_de",
        timestamps: false,
    }
);

export default EstResponsableDe;