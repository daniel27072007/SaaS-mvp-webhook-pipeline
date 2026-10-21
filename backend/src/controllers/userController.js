import { userModel } from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const getProfile = async (req, res) => {
    try{
        const userId = req.userId
        const databaseUser = await userModel.findOne({ _id: userId }).select(["name", "email", "subscription", "subscriptionStatus"])
        if(!databaseUser){
            return res.status(404).json({ error: "User not found" })
        }
        console.log("user found, sending info...")
        return res.status(200).json(databaseUser)
    } catch (error) {
        console.error("Error fetching profile:", error)
        return res.status(500).json({ Error: "Internal server error" })
    }
}

export const updatePassaword = async (req, res) => {
    try {
        const userId = req.userId
        const { password, newPassword } = req.body
        if(!password || !newPassword){
            return res.status(400).json({ error: 'Bad Request', message: 'both new and old are required.'})
        }
        const databaseUser = await userModel.findOne({ _id: userId }).select(["password"])
        if(!databaseUser){
            return res.status(404).json({ error: "User not found"})
        }
        const isPasswordValid = await bcrypt.compare(password, databaseUser.password)
        if(!isPasswordValid){
            return res.status(401).json({ error: 'Invalid password.' });         
        }
        const isSamePassword = await bcrypt.compare(newPassword, databaseUser.password);
        if (isSamePassword) {
        return res.status(400).json({ error: 'Bad Request', message: 'New password cannot be the same as the old password.' });
        }
        databaseUser.password = newPassword
        await databaseUser.save()
        return res.status(200).json({ message: "password updated with success"})
    } catch (error) {
        if(error.name === 'ValidationError'){
            return res.status(400).json({
                error: 'Bad Request',
                message: error.message
            })
        }
        res.status(500).json({ error: 'Internal server error, failed to update the password'})
    }
}