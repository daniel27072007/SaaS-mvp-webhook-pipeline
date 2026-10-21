import { Router } from "express";
import { aiAdvisorInsights, analyticsReports, dashboardSummary } from "../controllers/featuresController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const featuresRouter = Router()

featuresRouter.get('/api/features/dashboard-summary', authMiddleware(['none', 'normal', 'premium']), dashboardSummary)

featuresRouter.post('/api/features/analytics-reports', authMiddleware(['normal', 'premium']), analyticsReports)

featuresRouter.get('/api/features/ai-advisor-insights', authMiddleware(['premium']), aiAdvisorInsights)

export default featuresRouter