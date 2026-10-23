import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { checkout, webhook } from '../controllers/paymentsController.js'

const paymentsRouter = Router()

paymentsRouter.post('/api/payments/checkout', authMiddleware(['none', 'normal', 'premium']), checkout)

paymentsRouter.post('/api/payments/webhook', webhook)

export default paymentsRouter