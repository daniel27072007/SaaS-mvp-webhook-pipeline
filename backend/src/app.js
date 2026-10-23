import express from 'express'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import featuresRouter from './routes/features.routes.js'
import paymentsRouter from './routes/payments.routes.js'

const app = express()

app.use(express.json({
    verify: (req, res, buf) => {
        // Captura o corpo bruto se a URL contiver a palavra 'webhook'
        if (req.url && req.url.includes('webhook')) {
            req.rawBody = buf;
        }
    }
}));

app.use(authRouter)

app.use(userRouter)

app.use(featuresRouter)

app.use(paymentsRouter)

app.use((error, req, res, next)=>{
    console.error('Unexpected server error', error.stack)
    return res.status(500).json({ 
        error: "Internal Server Error", 
        message: "An unexpected error occurred on the server." 
    });
})

export default app