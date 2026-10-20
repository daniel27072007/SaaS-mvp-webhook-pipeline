export const freeRoute = async (req, res) => {
    console.log('this is a route that everyone have access');
    res.status(200).json({ message: 'Hello Everyone'})
}

export const userSubscribedRoute = async (req, res) => {
    console.log('this is a route that normal and premium subscription have access');
    res.status(200).json({ message: 'Hello User Subscribed'})
}

export const premiumRoute = async (req, res) => {
    console.log('this is a route that premium subscription have access');
    res.status(200).json({ message: 'Hello Premium'})
}