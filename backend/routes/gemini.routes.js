import { Router } from 'express'
const router = Router();
import * as geminiController from "../controllers/gemini.controller.js"

router.get("/get-result", geminiController.getResult )


export default router;
