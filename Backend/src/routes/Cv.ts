import { Router } from "express";
import { upload } from "../utils/multer";
import { analyzeCVFromFile,getAnalyze } from "../controllers/Cv";

const router = Router();

router.post("/analyze", upload.single("cv"), analyzeCVFromFile);

router.get("/analyze", getAnalyze);


export default router;
