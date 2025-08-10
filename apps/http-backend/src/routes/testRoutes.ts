import { Router } from "express";
import { testMessage } from "../controllers/test"; 

const router = Router();

router.post('/test', testMessage)

export default router;