import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const BaremeFrais = sequelize.define(
    "BaremeFrais",
    {
        bareme_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
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

        montant: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        tableName: "bareme_frais",
        timestamps: false,
    }
);

export default BaremeFrais;