import {DataTypes} from "sequelize"
import sequelize from "../../config/database.js"

const Etablissement=sequelize.define("etablissement",{
    eta_id:{
        type:DataTypes.STRING(36),
        primaryKey:true,
        allowNull:false,
    },
    eta_code:{
        type:DataTypes.STRING(50),
        allowNull:false,
        unique:true,
    },
    eta_nom:{
        type:DataTypes.STRING(255),
        allowNull:false,
        
    },
    eta_type:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    eta_adresse:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    eta_ville:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    eta_pays:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    eta_tel:{
        type:DataTypes.STRING(20),
        allowNull:true,
    },
    eta_email:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    eta_statut:{
        type:DataTypes.STRING(20),
        allowNull:false,
        defaultValue:"actif",
    },
    eta_statut:{
        type:DataTypes.STRING(20),
        allowNull:false,
        defaultValue:"actif",
    },
    eta_heure_ouverture:{
        type:DataTypes.TIME,
        allowNull:false,
        defaultValue:"07:00:00",
    },
    eta_heure_fermeture:{
        type:DataTypes.TIME,
        allowNull:false,
        defaultValue:"18:00:00",
    },

},
{
    tableName:"etablissement",
    timestamps:false,
}
)

export default Etablissement
