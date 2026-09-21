import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Personnel = sequelize.define(
    "Personnel",
    {
        rh_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },

        usr_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
            unique: true,
        },

        rh_matricule: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        rh_fonction: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        rh_date_embauche: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        rh_salaire_base: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        tableName: "personnel",
        timestamps: false,
    }
);

export default Personnel;