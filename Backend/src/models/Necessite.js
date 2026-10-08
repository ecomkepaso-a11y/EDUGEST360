import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Necessite = sequelize.define(
    "Necessite",
    {
        ins_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },

        piece_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },

        fournie: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        date_depot: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        tableName: "necessite",
        timestamps: false,
    }
);

export default Necessite;