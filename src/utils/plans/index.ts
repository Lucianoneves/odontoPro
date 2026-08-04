import type { Plan } from "@/generated/prisma/client";

export type PlanDetailsProps = {
  maxServices: number;
};

export type PlansProps = {
  BASIC: PlanDetailsProps;
  PROFESSIONAL: PlanDetailsProps;
};

export type SubscriptionPlanItem = {
  id: Plan;
  name: string;
  description: string;
  oldPrice: string;
  price: string;
  features: string[];
};

export const Plans: PlansProps = {
  BASIC: {
    maxServices: 3,
  },
  PROFESSIONAL: {
    maxServices: 50,
  },
};

export const subscriptionPlan: SubscriptionPlanItem[] = [
  {
    id: "BASIC",
    name: "Básico",
    description: "Perfeito para clínicas menores",
    oldPrice: "100,00",
    price: "32,90",
    features: [
      `Até ${Plans.BASIC.maxServices} serviços`,
      "Agendamentos limitados",
      "Suporte por e-mail",
      "Relatórios básicos",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Profissional",
    description: "Perfeito para clínicas em crescimento",
    oldPrice: "199,00",
    price: "42,90",
    features: [
      `Até ${Plans.PROFESSIONAL.maxServices} serviços`,
      "Agendamentos ilimitados",
      "Suporte prioritário",
      "Relatórios com IA",
    ],
  },
];
