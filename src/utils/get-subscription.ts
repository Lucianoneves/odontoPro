"use server";

import prisma from "@/lib/prisma";
import { stripe } from "@/utils/stripe";
import type { Plan } from "@/generated/prisma/client";

function resolvePlanFromPriceId(priceId: string): Plan {
  const basicPrice = process.env.STRIPE_PLAN_BASIC?.trim();
  const proPrice = process.env.STRIPE_PLAN_PRO?.trim();

  if (priceId === proPrice) return "PROFESSIONAL";
  if (priceId === basicPrice) return "BASIC";
  return "BASIC";
}

/**
 * Grava/atualiza assinatura ativa no banco a partir do Stripe.
 */
async function upsertLocalSubscription(
  userId: string,
  active: {
    id: string;
    status: string;
    priceId: string;
    plan: Plan;
  }
) {
  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existing) {
    if (existing.id !== active.id) {
      await prisma.subscription.delete({ where: { userId } });
      return prisma.subscription.create({
        data: {
          id: active.id,
          userId,
          status: active.status,
          priceId: active.priceId,
          plan: active.plan,
        },
      });
    }

    return prisma.subscription.update({
      where: { userId },
      data: {
        status: active.status,
        priceId: active.priceId,
        plan: active.plan,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      id: active.id,
      userId,
      status: active.status,
      priceId: active.priceId,
      plan: active.plan,
    },
  });
}

/**
 * Fonte da verdade: Stripe.
 * - Sem assinatura ativa no Stripe → apaga do banco e retorna null
 * - Com assinatura ativa → sincroniza e retorna
 */
export async function getSubscription(userId: string) {
  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripe_customer_id: true },
    });

    const customerId = user?.stripe_customer_id?.trim();

    // Sem customer Stripe: limpa qualquer residual e sai
    if (!customerId) {
      await prisma.subscription.deleteMany({ where: { userId } });
      return null;
    }

    // Busca assinaturas válidas no Stripe (active ou trialing)
    const [activeList, trialingList] = await Promise.all([
      stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      }),
      stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      }),
    ]);

    const stripeSub = activeList.data[0] ?? trialingList.data[0];

    // Não há plano ativo no Stripe → remove do banco
    if (!stripeSub) {
      await prisma.subscription.deleteMany({ where: { userId } });
      return null;
    }

    const priceId = stripeSub.items.data[0].price.id;
    const plan = resolvePlanFromPriceId(priceId);

    return upsertLocalSubscription(userId, {
      id: stripeSub.id,
      status: stripeSub.status,
      priceId,
      plan,
    });
  } catch (error) {
    console.error("Falha ao sincronizar assinatura", error);

    // Fallback: se o banco tiver algo inativo, limpa
    try {
      const local = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (local && local.status !== "active" && local.status !== "trialing") {
        await prisma.subscription.deleteMany({ where: { userId } });
        return null;
      }

      return local;
    } catch {
      return null;
    }
  }
}
