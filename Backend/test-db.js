import sequelize from "./config/database.js";
import "./src/models/index.js";

async function testModels() {
    try {
        await sequelize.authenticate();

        console.log("Database connection successful");
        console.log("Models and associations loaded successfully");
    } catch (error) {
        console.error("❌ Model test failed!");
        console.error(error.message);
    } finally {
        await sequelize.close();
    }
}

testModels();