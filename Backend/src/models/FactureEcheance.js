import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const FactureEcheance = sequelize.define(
    "FactureEcheance",
    {
        fact_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        fin_montant_frais: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },

        fin_date_echeance: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        fin_statut: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "en_attente",
        },

        mat_eleve: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    },
    {
        tableName: "facture_echeance",
        timestamps: false,
    }
);

export default FactureEcheance;