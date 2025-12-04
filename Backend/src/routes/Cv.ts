import { Router } from "express";
import { upload } from "../utils/multer";
import { analyzeCV,getAnalyze, } from "../controllers/Cv";
import { parseCv } from"../controllers/Cv";


const router = Router();

router.post("/analyze", analyzeCV);
router.post("/parse", upload.single("cv"), parseCv);



router.get("/analyze", getAnalyze);


export default router;
