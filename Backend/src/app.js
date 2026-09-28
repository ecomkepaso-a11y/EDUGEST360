import express from "express"
import testRoutes from "./routes/test.routes.js"
import logger from "./middlewares/logger.js"
import errorHandler from "./middlewares/errorHandler.js";
import etablissementRoutes from "./routes/etablissement.routes.js";
import utilisateurRoutes from "./routes/utilisateur.routes.js";
import eleveRoutes from "./routes/eleve.routes.js";
import enseignantRoutes from "./routes/enseignant.routes.js";
import personnelRoutes from "./routes/personnel.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import estResponsableDeRoutes from "./routes/estResponsableDe.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app=express();

app.use(express.json())

//logger
app.use(logger)

//testing the api 
app.use("/api",testRoutes)
app.use("/api/v1/auth", authRoutes);
//ROUTES
app.use("/api/v1/etablissements", etablissementRoutes);
app.use("/api/v1/utilisateurs", utilisateurRoutes);
app.use("/api/v1/eleves", eleveRoutes);
app.use("/api/v1/enseignants", enseignantRoutes);
app.use("/api/v1/personnels", personnelRoutes);
app.use("/api/v1/parents", parentRoutes);
app.use("/api/v1/responsabilites", estResponsableDeRoutes);

//error handling
app.use(errorHandler);


//Welcome message
app.get("/",(req,res)=>{
    res.json({
        message:"Hello EduGest 360"
    })
})

export default app