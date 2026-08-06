"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PlanCheckoutToastProps {
  success?: string;
  cancel?: string;
}

export function PlanCheckoutToast({ success, cancel }: PlanCheckoutToastProps) {
  const router = useRouter();

  useEffect(() => {
    if (success === "true") {
      toast.success("Assinatura confirmada! Carregando seu plano...");
      // Atualiza a página para buscar a assinatura no Stripe/banco
      router.replace("/dashboard/plans");
      router.refresh();
    }

    if (cancel === "true") {
      toast.message("Checkout cancelado. Você pode tentar novamente.");
      router.replace("/dashboard/plans");
    }
  }, [success, cancel, router]);

  return null;
}
