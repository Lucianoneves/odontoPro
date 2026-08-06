"use server";

import type { Plan } from "@/generated/prisma/client";
import { Plans, type PlanDetailsProps } from "@/utils/plans/index";

export type PlanDetailInfo = PlanDetailsProps;

export async function getPlan(planId: Plan): Promise<PlanDetailInfo> {
  return Plans[planId];
}
