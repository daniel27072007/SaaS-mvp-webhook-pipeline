import { userModel } from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const getProfile = async (req, res) => {
    try{
        const userId = req.userId
        const databaseUser = await userModel.findOne({ _id: userId }).select(["name", "email", "subscription", "subscriptionStatus"])
        if(!databaseUser){
            return res.status(404).json({ Error: "User not found" })
        }
        console.log("user found, sending info...")
        return res.status(200).json(databaseUser)
    } catch (error) {
        console.error("Error fetching profile:", error)
        return res.status(500).json({ Error: "Internal server error" })
    }
}