import express from "express"
import { ping,welcome } from "../controllers/test.controller.js";

const router=express.Router()

router.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Edugest is running",
        status:"ok"
    })
})

router.get("/ping",ping)

router.get("/welcome", welcome);


router.post("/echo",(req,res)=>{
    res.json({
        received: req.body
    })
})

export default router