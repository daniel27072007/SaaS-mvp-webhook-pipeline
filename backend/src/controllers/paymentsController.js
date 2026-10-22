import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const checkout = async (req, res) => {
    try {
        const { priceId } = req.body
        if(!priceId){
            return res.status(400).json({ 
                error: "O campo priceId é obrigatório para iniciar o checkout." 
            });
        }
        const userId = req.userId
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{price: priceId, quantity: 1}],
            metadata: { userId : userId },
            success_url: `http://localhost:5173/dashboard?success=true`,
            cancel_url: `http://localhost:5173/pricing?canceled=true`,
        })
        return res.status(200).json({ success: true, url: session.url});
    } catch (error) {
        console.error("Erro no processo de checkout:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}