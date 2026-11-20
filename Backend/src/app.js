import cors from "cors";
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
import classeRoutes from "./routes/classe.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.js";
import pieceRequiseRoutes from "./routes/pieceRequise.routes.js";
import inscriptionRoutes from "./routes/inscription.routes.js";
import baremeFraisRoutes from "./routes/baremeFrais.routes.js";
import salleRoutes from "./routes/salle.routes.js";
import matiereRoutes from "./routes/matiere.routes.js";
import creneauRoutes from "./routes/creneau.routes.js";
import planningRoutes from "./routes/planning.routes.js";
import congeRoutes from "./routes/conge.routes.js";


const app=express();

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json())

//logger
app.use(logger)

// Swagger / OpenAPI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use("/api/v1/classes", classeRoutes);
app.use("/api/v1/pieces-requises",pieceRequiseRoutes);
app.use("/api/v1/salles", salleRoutes);
app.use("/api/v1/matieres", matiereRoutes);
app.use("/api/v1/inscriptions",inscriptionRoutes);
app.use("/api/v1/baremes-frais", baremeFraisRoutes);
app.use("/api/v1/creneaux", creneauRoutes);
app.use("/api/v1/planning", planningRoutes);
app.use("/api/v1/conges", congeRoutes);   

//error handling
app.use(errorHandler);


//Welcome message
app.get("/",(req,res)=>{
    res.json({
        message:"Hello EduGest 360"
    })
})

export default app