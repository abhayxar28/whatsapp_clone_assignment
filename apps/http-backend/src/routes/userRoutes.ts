import { Router } from "express";
import { createUser, loginUser, userAuth } from "../controllers/user";
import { authenticateJWT } from "../middleware";

const router = Router();

router.post('/create-user', createUser)
router.post('/login-user', loginUser)
router.get('/user-auth', authenticateJWT, userAuth)

export default router;