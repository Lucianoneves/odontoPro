import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { manageSubscription } from "@/utils/manage-subscription";
import { Plan } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const text = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await manageSubscription(
          subscription.id,
          subscription.customer.toString(),
          false,
          true
        );

        revalidatePath("/dashboard/plans");
        revalidatePath("/dashboard/services");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await manageSubscription(
          subscription.id,
          subscription.customer.toString(),
          false,
          false
        );

        revalidatePath("/dashboard/plans");
        revalidatePath("/dashboard/services");
        break;
      }

      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        const type = checkoutSession.metadata?.type
          ? (checkoutSession.metadata.type as Plan)
          : Plan.BASIC;

        const userId = checkoutSession.metadata?.userId;

        if (checkoutSession.subscription && checkoutSession.customer) {
          await manageSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString(),
            true,
            false,
            type,
            userId
          );
        }

        revalidatePath("/dashboard/plans");
        revalidatePath("/dashboard/services");
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error("Erro ao processar webhook Stripe", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
};
