import { Router } from "express";
import { getProfile, updatePassaword } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.get('/api/users/profile', authMiddleware(['none', 'normal', 'premium']), getProfile)

userRouter.post('/api/users/profile', authMiddleware(['none', 'normal', 'premium']), updatePassaword)

export default userRouter