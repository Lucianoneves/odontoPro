"use server";

import prisma from "@/lib/prisma";
import { addDays, isAfter, differenceInDays } from "date-fns";
import { TRAIL_LIMITS } from "@/utils/permissions/trial-limits";

export async function checkSubscription(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    throw new Error("Usuario não encontrado");
  }

  if (user.subscription && user.subscription.status === "active") {
    return {
      subscriptionStatus: "active",
      message: "Assinatura ativa",
      planId: user.subscription.plan,
      daysRemaining: null as number | null,
    };
  }

  const trialEndDate = addDays(user.createdAt!, TRAIL_LIMITS);

  if (isAfter(new Date(), trialEndDate)) {
    return {
      subscriptionStatus: "EXPIRED",
      message: "Sua assinatura expirou",
      planId: "TRIAL",
      daysRemaining: null as number | null,
    };
  }

  // trialEndDate - hoje = dias que faltam
  const daysRemaining = Math.max(
    0,
    differenceInDays(trialEndDate, new Date())
  );

  return {
    subscriptionStatus: "TRIAL",
    message: "Você está no período de teste gratuito.",
    planId: "TRIAL",
    daysRemaining,
  };
}
