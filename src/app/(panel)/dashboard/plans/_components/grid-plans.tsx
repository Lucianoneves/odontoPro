import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionPlan } from "@/utils/plans";
import { Check } from "lucide-react";

export function GridPlans() {
    return (
        <article>
           { subscriptionPlan.map((plan, index) => ( // map para percorrer o array de planos
            <Card key={plan.id} className=" flex flex-col w-full mx-auto">
                {index == 1  && (
                    <div className=" bg-blue-300 w-full p-2 text-center rounded-t-xl ">
                        <p className=" text-white font-semibold"> Promoção Exclusiva</p>
                    </div>
                )}
                <CardHeader>
                    <CardTitle>
                        {plan.name}
                        </CardTitle>
                    <CardDescription>
                        {plan.description}
                        </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul> 
                        {plan.features.map((feature, index) => (
                            <li key={feature}>                                
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
           ))}
        </article>
    )
 }

