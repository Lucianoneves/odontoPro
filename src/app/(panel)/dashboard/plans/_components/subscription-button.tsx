"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSubscription } from "../_actions/create-subscription";
import { Plan } from "@/generated/prisma/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubscriptionButtonProps {
  type: Plan;
}

export function SubscriptionButton({ type }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCreateBilling() {
    setLoading(true);

    try {
      const { url, error } = await createSubscription({ type });

      if (error) {
        toast.error(error);
        return;
      }

      if (url) {
        window.location.href = url;
        return;
      }

      toast.error("Não foi possível iniciar o checkout");
    } catch {
      toast.error("Erro ao processar assinatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className={`w-full cursor-pointer ${
        type === "PROFESSIONAL" ? "bg-blue-600 hover:bg-blue-500" : ""
      }`}
      onClick={handleCreateBilling}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Redirecionando...
        </>
      ) : (
        "Assinar agora"
      )}
    </Button>
  );
}
