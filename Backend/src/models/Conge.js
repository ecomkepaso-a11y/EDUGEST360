import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";


const Conge = sequelize.define(
    "Conge",
    {
        conge_id: { type: DataTypes.STRING(36), allowNull: false, primaryKey: true },
        conge_date_debut: { type: DataTypes.DATEONLY, allowNull: false },
        conge_date_fin: { type: DataTypes.DATEONLY, allowNull: false },
        conge_motif: { type: DataTypes.STRING(255), allowNull: false },
        rh_statut_conge: {
            type: DataTypes.ENUM("en_attente", "valide", "refuse"),
            allowNull: false,
            defaultValue: "en_attente",
        },
        rh_id: { type: DataTypes.STRING(36), allowNull: false },
        usr_id: { type: DataTypes.STRING(36), allowNull: false },
    },
    { tableName: "conge", timestamps: false }
);

export default Conge;