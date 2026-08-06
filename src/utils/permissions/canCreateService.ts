"use server";

import type { Session } from "next-auth";
import type { Subscription } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { Plans } from "@/utils/plans";
import { getPlan } from "./get-plans";
import type { PlanDetailInfo } from "./get-plans";

interface CanCreateServiceResult {
  hasPermission: boolean;
  planId: string;
  expired: boolean;
  plan: PlanDetailInfo | null;
}

export async function canCreateService(
  subscription: Subscription | null,
  session: Session
): Promise<CanCreateServiceResult> {
  try {
    const serviceCount = await prisma.service.count({
      where: {
        userId: session?.user?.id,
      },
    });

    if (subscription && subscription.status === "active") {
      const planLimits = await getPlan(
        subscription.plan as "BASIC" | "PROFESSIONAL"
      );

      return {
        hasPermission: serviceCount < planLimits.maxServices,
        planId: subscription.plan,
        expired: false,
        plan: Plans[subscription.plan as "BASIC" | "PROFESSIONAL"],
      };
    }

    // Sem assinatura ativa: limite do plano básico (trial)
    const trialLimits = Plans.BASIC;

    return {
      hasPermission: serviceCount < trialLimits.maxServices,
      planId: "TRIAL",
      expired: true,
      plan: trialLimits,
    };
  } catch (error) {
    console.error("Erro ao verificar permissão de serviço", error);

    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }
}
