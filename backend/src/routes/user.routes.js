import { Router } from "express";
import { freeRoute, premiumRoute, userSubscribedRoute } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.post('/everyone', authMiddleware(['none', 'normal', 'premium']), freeRoute)

userRouter.post('/subscribed', authMiddleware(['normal', 'premium']), userSubscribedRoute)

userRouter.post('/premium', authMiddleware(['premium']), premiumRoute)

export default userRouter