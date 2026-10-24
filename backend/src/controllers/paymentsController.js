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
        let purchasedPlan = 'normal';
        console.log("Price recebido:", priceId, "Esperado Premium:", process.env.STRIPE_PREMIUM_PRICE)
        if (priceId === process.env.STRIPE_PREMIUM_PRICE) {
            purchasedPlan = 'premium';
            console.log("premium")
        }
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{price: priceId, quantity: 1}],
            metadata: { userId : userId, userSubscription: purchasedPlan },
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
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endPointSecret)
    } catch (error) {
        console.error(`Validation Error in Webhook: ${error.message}`);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.userId
                const userSubscription = session.metadata?.userSubscription || 'none'
                const stripeSubscriptionId = session.subscription
                const databaseUser = await userModel.findOne({ _id: userId }).select(["subscription", "subscriptionStatus", "stripeSubscriptionId"])
                if(!databaseUser){
                    return res.status(400).json({ error: "User not found"}) //not 404 so stripe dosent think is a error 404 about him sending the req
                }
                databaseUser.subscription = userSubscription
                databaseUser.subscriptionStatus = 'active'
                databaseUser.stripeSubscriptionId = stripeSubscriptionId
                await databaseUser.save()
                break
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const stripeSubscriptionId = subscription.id;
                const databaseUser = await userModel.findOne({ stripeSubscriptionId: stripeSubscriptionId }).select(["subscription", "subscriptionStatus", "stripeSubscriptionId"])
                if (!databaseUser) {
                    console.log(`Warning: Subscription ${stripeSubscriptionId} canceled, but the user was not found.`);
                    break;
                }
                databaseUser.subscription = 'none'
                databaseUser.subscriptionStatus = 'none'
                databaseUser.stripeSubscriptionId = null
                await databaseUser.save()
                console.log(`User subscription ${databaseUser._id} was reseted with success to "none".`)
                break
            }

            default:
                console.log('Another event recived:', event.type)
                break;
        }
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error when processing webhook data:", error);
        return res.status(500).json({ error: "Internal Error." });
    }
}