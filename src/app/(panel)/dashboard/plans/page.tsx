import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { GridPlans } from "./_components/grid-plans";
import { getSubscription } from "@/utils/get-subscription";
import { SubscriptionDetail } from "./_components/subscription-detail";
import { PlanCheckoutToast } from "./_components/plan-checkout-toast";

interface PlansPageProps {
  searchParams: Promise<{
    success?: string;
    cancel?: string;
  }>;
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { success, cancel } = await searchParams;
  const subscription = await getSubscription(session.user?.id! ?? "");
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PlanCheckoutToast success={success} cancel={cancel} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground">
          {isActive
            ? "Detalhes do seu plano ativo."
            : "Escolha o plano ideal para sua clínica e continue no checkout seguro do Stripe."}
        </p>
      </div>

      {/* Assinatura ativa → só o plano contratado | Sem assinatura → cards para assinar */}
      {isActive ? (
        <SubscriptionDetail subscription={subscription} />
      ) : (
        <GridPlans />
      )}
    </div>
  );
}
