import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

// Créneau hebdomadaire récurrent : pas de date, seulement un jour de semaine.
const CreneauPlanning = sequelize.define(
    "CreneauPlanning",
    {
        plan_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },

        // lundi … dimanche, en minuscules (CHECK en base)
        plan_jour: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },

        // Format "HH:MM:SS" : jamais de date complète
        plan_heure_debut: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        plan_heure_fin: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        // 'actif' | 'annule' (CHECK en base)
        plan_statut: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "actif",
        },

        code_classe: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        matiere_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        enseignant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        salle_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    },
    {
        tableName: "creneau_planning",
        timestamps: false,
    }
);

export default CreneauPlanning;