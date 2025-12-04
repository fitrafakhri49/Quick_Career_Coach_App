import { Router } from "express";
import {skillAnalysis} from "../controllers/Skill";

const router = Router();

router.post("/skillAnalysis", skillAnalysis);


export default router;
