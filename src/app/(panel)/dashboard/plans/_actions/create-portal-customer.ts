"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/utils/stripe";

export async function createPortalCustomer() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      url: null,
      error: "Usuário não autenticado",
    };
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  const customerId = user?.stripe_customer_id?.trim();

  if (!customerId) {
    return {
      url: null,
      error: "Cliente Stripe não encontrado",
    };
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/plans`,
    });

    return {
      url: portalSession.url,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      url: null,
      error: "Falha ao abrir o portal de assinatura",
    };
  }
}
