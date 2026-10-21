import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const authRouter = Router()

authRouter.post('/api/auth/register', registerUser)

authRouter.post('/api/auth/login', loginUser)

export default authRouter