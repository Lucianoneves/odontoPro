import Stripe from "stripe"; 


export const stripe = new Stripe( // cria uma nova instância do Stripe
    process.env.STRIPE_SECRET_KEY as string, 
    { 
        apiVersion: '2026-07-29.dahlia',
        typescript: true,
    }
);