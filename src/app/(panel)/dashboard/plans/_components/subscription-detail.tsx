import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface SubscriptionDetailProps {
  plan: string;
  status: string;
}

const planLabels: Record<string, string> = {
  BASIC: "Básico",
  PROFESSIONAL: "Profissional",
};

export function SubscriptionDetail({ plan, status }: SubscriptionDetailProps) {
  return (
    <Card className="mx-auto max-w-lg border-emerald-200 bg-emerald-50/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <CardTitle>Assinatura ativa</CardTitle>
        </div>
        <CardDescription>
          Sua clínica já possui um plano ativo no OdontoPro.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-muted px-3 py-1 text-sm font-medium">
          Plano {planLabels[plan] ?? plan}
        </span>
        <span className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium capitalize text-white">
          {status}
        </span>
      </CardContent>
    </Card>
  );
}
