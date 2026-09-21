import { Sequelize } from "sequelize";
import "dotenv/config";

//les strings des connection dans .env
const sequelize=new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect:'mysql',
        
        //pour montrer les logging dans le console
        logging:console.log,

    }
)

export default sequelize