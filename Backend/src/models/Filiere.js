import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Filiere = sequelize.define(
    "Filiere",
    {
        code_filiere: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },

        libelle_filiere: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: "filiere",
        timestamps: false,
    }
);

export default Filiere;