import { userModel } from '../models/user.model.js'
import Stripe from 'stripe'
import 'dotenv/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const checkout = async (req, res) => {
    try {
        const { priceId } = req.body
        if(!priceId){
            return res.status(400).json({ 
                error: "priceId is required to use checkout." 
            });
        }
        const userId = req.userId
        const userSubscription = req.userSubscription
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{price: priceId, quantity: 1}],
            metadata: { userId : userId, userSubscription: userSubscription },
            success_url: `http://localhost:5173/dashboard?success=true`,
            cancel_url: `http://localhost:5173/pricing?canceled=true`,
        })
        return res.status(200).json({ success: true, url: session.url});
    } catch (error) {
        console.error("Error in the checkout process:", error);
        return res.status(500).json({ error: "Error: Internal Server Error." });
    }
}

export const webhook = async (req, res) => {
    const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET
    const sig = req.headers['stripe-signature']
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret)
    } catch (error) {
        console.error(`Validation Error in Webhook: ${error.message}`);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.userId
                const userSubscription = session.metadata?.userSubscription
                const stripeSubscriptionId = session.subscription
                const databaseUser = await userModel.findOne({ _id: userId }).select(["subscription"])
                if(!databaseUser){
                    return res.status(400).json({ error: "User not found"}) //not 404 so stripe dosent think is a error 404 about him sending the req
                }
                databaseUser.subscription = userSubscription
                await databaseUser.save()
                break
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                console.log('subscription cancelled')
                break
            }

            default:
                console.log('another event recived:', event.type)
                break;
        }
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error when processing webhook data:", error);
        return res.status(500).json({ error: "Internal Error." });
    }
}