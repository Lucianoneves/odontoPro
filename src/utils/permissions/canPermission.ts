"use server";

import { auth } from "@/lib/auth";
import type { PlanDetailInfo } from "./get-plans";
import { getSubscription } from "@/utils/get-subscription";

// BASIC | PROFESSIONAL | EXPIRED | TRIAL
export type PLAN_PROP = "BASIC" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";

export interface ResultPermissionProps {
  hasPermission: boolean;
  planId: string;
  expired: boolean;
  plan: PlanDetailInfo | null;
}

interface CanPermissionProps {
  type: "service";
}

export async function canPermission({
  type,
}: CanPermissionProps): Promise<ResultPermissionProps> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }

  // Sincroniza com o Stripe (remove assinatura cancelada do banco)
  const subscription = await getSubscription(session.user.id);
  const activeSubscription =
    subscription?.status === "active" ? subscription : null;

  switch (type) {
    case "service": {
      const { canCreateService } = await import("./canCreateService");
      return canCreateService(activeSubscription, session);
    }

    default:
      return {
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      };
  }
}
