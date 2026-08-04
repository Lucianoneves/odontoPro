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
      toast.success("Pagamento iniciado com sucesso! Aguarde a confirmação.");
      router.replace("/dashboard/plans");
    }

    if (cancel === "true") {
      toast.message("Checkout cancelado. Você pode tentar novamente.");
      router.replace("/dashboard/plans");
    }
  }, [success, cancel, router]);

  return null;
}
