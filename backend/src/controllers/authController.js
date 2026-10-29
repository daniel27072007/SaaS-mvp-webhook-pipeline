import { userModel } from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const registerUser = async (req, res) => {
    try {
        const registerData = req.body
        if(!registerData.subscription){
            registerData.subscription = "none"
        }
        if(!registerData.name || !registerData.email || !registerData.password){
            return res.status(400).json({ error: 'Bad Request', message: 'name, email and password are required.'})
        }
        if(registerData.subscription !== 'premium' && registerData.subscription !== 'normal' && registerData.subscription !== 'none'){
            return res.status(400).json({ error: 'Bad Request', message: 'you can only input premium, normal or none'})
        }
        const userData = {
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            subscription: "none",
            subscriptionStatus: "none",
            paymentCustomerId: null,
            stripeSubscriptionId: null
        }
        const registeredUser = new userModel(userData)
        const savedUser = await registeredUser.save()
        const tokenAccess = jwt.sign(
            {userId: savedUser._id, userSubscription: savedUser.subscription},
            process.env.TOKEN_ACCESS_KEY,
            {expiresIn: process.env.TOKEN_ACCESS_KEY_EXPIRES}
        )
        return res.status(201).json({ message: 'User registered with success!', 'access-token': tokenAccess})
    } catch (error) {
        if (error.code === 11000) {
            // Se o erro incluir o campo 'name'
            if (error.message && error.message.includes('name')) {
                return res.status(400).json({ 
                    error: 'Bad Request', 
                    message: 'This username is already taken.' 
                });
            }
            // Se for o e-mail ou qualquer outro padrão
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'This email was already registered.' 
            });
        }
        console.error("Registration Error:", error.message || error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'something wrong happened when registering the user' 
        });
    }
}

export const loginUser = async (req, res) => {
    try {
        const loginData = req.body
        if(!loginData.email || !loginData.password){
            return res.status(400).json({ error: 'Bad Request', message: 'email and password are required.'})
        }
        const loggedUser = await userModel.findOne({ email: loginData.email })
        if(!loggedUser){
            return res.status(400).json({ error: 'Invalid Email or Password.'})
        }
        const isPasswordValid = await bcrypt.compare(loginData.password, loggedUser.password)
        if(!isPasswordValid){
            return res.status(401).json({ error: 'Invalid Email or Password.' });         
        }
        const tokenAccess = jwt.sign(
            {userId: loggedUser._id, userSubscription: loggedUser.subscription},
            process.env.TOKEN_ACCESS_KEY,
            {expiresIn: process.env.TOKEN_ACCESS_KEY_EXPIRES}
        )
        return res.status(200).json({ message: 'User logged with success!', 'access-token': tokenAccess})
    } catch (error) {
        if(error.name === "ValidationError"){
            return res.status(400).json({ error: 'Bad Request', message: error.message})
        }
        res.status(500).json({ error: 'Something went wrong with the server when login the user.', error})
    }
}