import { Router } from "express";
import {startInterview,submitAnswer,getQuestion} from "../controllers/Interview";
import { requireAuth } from "../middlwares/auth";

const router = Router();

router.post("/interview/start",startInterview );
router.post("/interview/submit", submitAnswer);
router.get("/interview/:sessionId/question", getQuestion);


export default router;
