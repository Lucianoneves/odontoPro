import { NextRequest, NextResponse } from "next/server"; 
import  Stripe  from "stripe"; 
import {stripe} from "@/utils/stripe";

export const POST = async (request: Request) => {  
    const signature = request.headers.get("stripe-signature"); 

    if(!signature) { 
        return NextResponse.error();
    }

    console.log(""); 

    const text = await request.text();

    const event = stripe.webhooks.constructEvent(
        text,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string 

    )

    
   switch(event.type) {    // evento das  assinaturas
    case"customer.subscription.deleted":
    const payment = event.data.object as Stripe.Subscription; 

    console.log("Assinatura cancelada", payment);

    break;

    case"customer.subscription.updated": // atualização de assinatura
    const paymentIntent = event.data.object as Stripe.Subscription; 

    console.log("Assinatura atualizada", paymentIntent);

    break;

    case "checkout.session.completed": // checkout concluído
    const checkoutSession = event.data.object as Stripe.Checkout.Session; 

    console.log("Assinatura concluída", checkoutSession);
    break;

    default:  // evento não tratado 
    console.log(`Evento não tratado: ${event.type}`);


    }
    return NextResponse.json({ received: true });

  

}


