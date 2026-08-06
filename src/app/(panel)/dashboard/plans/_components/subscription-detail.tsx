"use client";

import { useState } from "react";
import type { Subscription } from "@/generated/prisma/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { subscriptionPlan } from "@/utils/plans/index";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { createPortalCustomer } from "../_actions/create-portal-customer";

interface SubscriptionDetailProps {
  subscription: Subscription;
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
  const [loading, setLoading] = useState(false);

  const planInfo = subscriptionPlan.find(
    (plan) => plan.id === subscription.plan
  );

  const isProfessional = subscription.plan === "PROFESSIONAL";

  async function handleManageSubscription() {
    setLoading(true);

    try {
      const { url, error } = await createPortalCustomer();

      if (error) {
        toast.error(error);
        return;
      }

      if (url) {
        window.location.href = url;
        return;
      }

      toast.error("Não foi possível abrir o portal");
    } catch {
      toast.error("Erro ao gerenciar assinatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg">
      <Card
        className={`flex w-full flex-col overflow-hidden ${
          isProfessional ? "border-blue-600" : ""
        }`}
      >
        <div
          className={`w-full p-2 text-center ${
            isProfessional ? "bg-blue-600" : "bg-emerald-600"
          }`}
        >
          <p className="font-semibold text-white">
            {isProfessional ? "Plano ativo · Recomendado" : "Plano ativo"}
          </p>
        </div>

        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">
                {planInfo?.name ?? subscription.plan}
              </CardTitle>
              <CardDescription className="mt-1">
                {planInfo?.description ?? "Sua assinatura está ativa."}
              </CardDescription>
            </div>
            <span className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white">
              ATIVO
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <ul className="space-y-2">
            {planInfo?.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm md:text-base"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {planInfo && (
            <div>
              <p className="text-sm text-muted-foreground line-through">
                R$ {planInfo.oldPrice}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                R$ {planInfo.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className={`w-full cursor-pointer ${
              isProfessional ? "bg-blue-600 hover:bg-blue-500" : ""
            }`}
            onClick={handleManageSubscription}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Abrindo...
              </>
            ) : (
              "Gerenciar assinatura"
            )}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
