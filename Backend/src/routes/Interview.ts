import { Router } from "express";
import {interview} from "../controllers/Interview";

const router = Router();

router.post("/interview", interview);


export default router;
