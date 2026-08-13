import express from "express"
import testRoutes from "./routes/test.routes.js"
import logger from "./middlewares/logger.js"
import errorHandler from "./middlewares/errorHandler.js";

const app=express();

app.use(express.json())

//logger
app.use(logger)

//testing the api 
app.use("/api",testRoutes)

//error handling
app.use(errorHandler);


//Welcome message
app.get("/",(req,res)=>{
    res.json({
        message:"Hello EduGest"
    })

})

export default app