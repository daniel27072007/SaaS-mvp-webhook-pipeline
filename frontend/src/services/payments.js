import api from './api.js'
/**
 * Inicia o fluxo de checkout criando uma sessão no Stripe através do Backend.
 * @param {string} priceId - O ID do preço configurado no Stripe (Normal ou Premium).
 */
export const redirectToCheckout = async (priceId) => {
    try {
        if(!priceId){
            throw new Error('priceId is nessesary to start the checkout')
        }
        const response = await api.post('/api/payments/checkout',  { priceId })
        const { success, url} = response.data
        if (success && url) {
            window.location.href = url;
        } else {
            throw new Error("The checkout session was created, but the URL was not sent.");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "Unknown error when starting the payment.";
        console.error("Error in the checkout services:", errorMessage);
        throw new Error(errorMessage);
    }
}