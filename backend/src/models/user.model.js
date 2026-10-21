import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    subscription: {type: String, enum: ['premium', 'normal', 'none'], default: 'none'},
    subscriptionStatus: {type: String, enum: ['active', 'past_due', 'canceled', 'trialing', 'none'], default: 'none'},
    paymentCustomerId: {type: String, default: null}
},{
    timestamps: true
})

userSchema.pre('save', async function () {
  const user = this;

  if (!user.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export const userModel = mongoose.model('userModel', userSchema)