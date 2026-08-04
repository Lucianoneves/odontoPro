"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/utils/stripe";
import { Plan } from "@/generated/prisma/client";

interface CreateSubscriptionProps {
  type: Plan;
}

export async function createSubscription({ type }: CreateSubscriptionProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      sessionId: "",
      url: null,
      error: "Falha ao ativar Plano",
    };
  }

  const findUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!findUser) {
    return {
      sessionId: "",
      url: null,
      error: "Falha ao ativar Plano",
    };
  }

  let customerId = findUser.stripe_customer_id?.trim() || null;

  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: findUser.email as string,
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripe_customer_id: stripeCustomer.id,
      },
    });

    customerId = stripeCustomer.id;
  }

  const priceId =
    type === Plan.BASIC
      ? process.env.STRIPE_PLAN_BASIC?.trim()
      : process.env.STRIPE_PLAN_PRO?.trim();

  if (!priceId) {
    return {
      sessionId: "",
      url: null,
      error: "Preço do plano não configurado",
    };
  }

  try {
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type: type,
        userId,
      },
      mode: "subscription",
      allow_promotion_codes: true,
      success_url:
        process.env.STRIPE_SUCCESS_URL?.trim() ??
        `${process.env.NEXT_PUBLIC_URL}/dashboard/plans?success=true`,
      cancel_url:
        process.env.STRIPE_CANCEL_URL?.trim() ??
        `${process.env.NEXT_PUBLIC_URL}/dashboard/plans?cancel=true`,
    });

    return {
      sessionId: stripeCheckoutSession.id,
      url: stripeCheckoutSession.url,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      sessionId: "",
      url: null,
      error: "Falha ao ativar Plano",
    };
  }
}
