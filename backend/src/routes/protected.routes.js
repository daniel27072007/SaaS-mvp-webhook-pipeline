import { Router } from "express";
import { freeRoute, premiumRoute, userSubscribedRoute } from "../controllers/protectedController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const protectedRouter = Router()

protectedRouter.post('/everyone', authMiddleware(['none', 'normal', 'premium']), freeRoute)

protectedRouter.post('/subscribed', authMiddleware(['normal', 'premium']), userSubscribedRoute)

protectedRouter.post('/premium', authMiddleware(['premium']), premiumRoute)

export default protectedRouter