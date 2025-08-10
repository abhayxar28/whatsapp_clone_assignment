import { Router } from "express";
import { getChatList, messageGet, messageSend } from "../controllers/message";
import { messageStatusUpdate } from "../controllers/message";
import { authenticateJWT } from "../middleware";

const router = Router();

router.post('/send-message', authenticateJWT, messageSend)
router.post('/update-status', authenticateJWT, messageStatusUpdate)
router.get('/message/:otherWaId', authenticateJWT, messageGet)
router.get('/chat-list', authenticateJWT, getChatList)

export default router;