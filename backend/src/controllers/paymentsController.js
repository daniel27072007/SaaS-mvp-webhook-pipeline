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
        //we will use this to check if the user already have that plan and its active and its trying to buy again
        let requestedPlan = 'normal';
        if (priceId === process.env.STRIPE_PREMIUM_PRICE) {
            requestedPlan = 'premium';
        }
        const userId = req.userId
        const userData = await userModel.findById(userId)
        if(!userData){
            return res.status(404).json({ error: "User not found."})
        }
        if(userData.subscription === requestedPlan && userData.subscriptionStatus === 'active'){
            return res.status(400).json({ 
                error: "Bad Request", 
                message: `You already have this as a active plan: ${requestedPlan}.` 
            });
        }
        //if the user is upgrading the plan
        if(userData.stripeSubscriptionId){
            const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId)
            await stripe.subscriptions.update(userData.stripeSubscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: priceId
                }],
                proration_behavior: 'create_prorations'
            })
            userData.subscription = requestedPlan
            userData.subscriptionStatus = 'active'
            await userData.save()
            return res.status(200).json({ success: true, url: 'http://localhost:5173/dashboard?success=true'});
        }
        //if is the user dosent have a plan
        else{
            let purchasedPlan = 'normal';
            if (priceId === process.env.STRIPE_PREMIUM_PRICE) {
                purchasedPlan = 'premium';
                console.log("premium")
            }
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                line_items: [{price: priceId, quantity: 1}],
                metadata: { userId : userId, userSubscription: purchasedPlan },
                    success_url: `http://localhost:5173/dashboard?success=true`,
                cancel_url: `http://localhost:5173/dashboard?success=false`,
            })
            return res.status(200).json({ success: true, url: session.url});
        }
    } catch (error) {
        console.error("Error in the checkout process:", error);
        return res.status(500).json({ error: "Error: Internal Server Error." });
    }
}

export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.userId
        const databaseUser = await userModel.findById(userId)
        if(!databaseUser){
            return res.status(404).json({ error: "User not found." })
        }
        if(!databaseUser.stripeSubscriptionId){
            return res.status(400).json({ error: "This user doesn't have an active subscription to cancel." })
        }
        //sends the stripe to cancel the plan in the webhook
        await stripe.subscriptions.cancel(databaseUser.stripeSubscriptionId)
        //already cancel the plan just for safety
        databaseUser.subscription = 'none';
        databaseUser.subscriptionStatus = 'none';
        databaseUser.stripeSubscriptionId = null;
        await databaseUser.save();
        return res.status(200).json({ success: true, message: 'Subscription canceled with success.' })
    } catch (error) {
        console.error("Error in the cancellation process:", error)
        return res.status(500).json({ error: "Internal Server Error.", message: error.message })
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
                const paymentCustomerId = session.customer

                const databaseUser = await userModel.findOne({ _id: userId }).select([
                    "subscription",
                    "subscriptionStatus",
                    "stripeSubscriptionId",
                    "paymentCustomerId"
                ])
                if(!databaseUser){
                    console.log(`Warning: Subscription ${stripeSubscriptionId} created, but the user was not found.`);
                    break
                }
                databaseUser.subscription = userSubscription
                databaseUser.subscriptionStatus = 'active'
                databaseUser.stripeSubscriptionId = stripeSubscriptionId
                databaseUser.paymentCustomerId = paymentCustomerId
                await databaseUser.save()
                break
            }
            
            case 'customer.subscription.updated': {
                const subscription = event.data.object
                const stripeSubscriptionId = subscription.id
                const newPriceId = subscription.items.data[0].price.id
                let updatedPlan = 'normal';
                if (newPriceId === process.env.STRIPE_PREMIUM_PRICE) {
                    updatedPlan = 'premium';
                    console.log("premium")
                }
                const databaseUser = await userModel.findOne({ stripeSubscriptionId: stripeSubscriptionId }).select([
                    "subscription",
                    "subscriptionStatus"
                ])
                if(!databaseUser){
                    console.log(`Warning: Subscription ${stripeSubscriptionId} updated, but the user was not found.`);
                    break
                }
                databaseUser.subscription = updatedPlan
                databaseUser.subscriptionStatus = 'active'
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