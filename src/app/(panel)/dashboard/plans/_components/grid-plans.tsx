import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionPlan } from "@/utils/plans";
import { Check } from "lucide-react";
import { SubscriptionButton } from "./subscription-button";

export function GridPlans() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {subscriptionPlan.map((plan, index) => (
        <Card
          key={plan.id}
          className={`mx-auto flex w-full flex-col ${
            index === 1 ? "border-blue-600" : ""
          }`}
        >
          {index === 1 && (
            <div className="w-full rounded-t-xl bg-blue-600 p-2 text-center">
              <p className="font-semibold text-white">Recomendado</p>
            </div>
          )}

          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm md:text-base"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground line-through">
                R$ {plan.oldPrice}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                R$ {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <SubscriptionButton type={plan.id} />
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
