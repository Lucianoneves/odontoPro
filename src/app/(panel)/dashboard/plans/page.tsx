import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { GridPlans } from "./_components/grid-plans";
import { getSubscription } from "@/utils/get-subscription";
import { PlanCheckoutToast } from "./_components/plan-checkout-toast";
import { SubscriptionDetail } from "./_components/subscription-detail";

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
  const subscription = await getSubscription(session.user.id!);
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PlanCheckoutToast success={success} cancel={cancel} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground">
          {isActive
            ? "Gerencie sua assinatura atual."
            : "Escolha o plano ideal para sua clínica e continue no checkout seguro do Stripe."}
        </p>
      </div>

      {isActive ? (
        <SubscriptionDetail
          plan={subscription.plan}
          status={subscription.status}
        />
      ) : (
        <GridPlans />
      )}
    </div>
  );
}
