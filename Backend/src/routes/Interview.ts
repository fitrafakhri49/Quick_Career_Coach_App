import { Router } from "express";
import {interview} from "../controllers/Interview";
import { requireAuth } from "../middlwares/auth";

const router = Router();

router.post("/interview", interview);


export default router;
