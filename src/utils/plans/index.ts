import { features } from "process"


export type PlanDetailsProps = {
    maxServices: number;
}

export type PlansProps = {
    BASIC: PlanDetailsProps;
    PROFESSIONAL: PlanDetailsProps;
}


export const  Plans: PlansProps = {  // planos de assinatura 
    BASIC: { 
        maxServices: 3,
 },
 PROFESSIONAL: { 
    maxServices: 2,
 },

}


export const subscriptionPlan=[
    {
    id: "BASIC",
    name:"BASIC",
    description:" Peefeito para clinicas menores",
    oldPrice: "R$ 100,00",
    price:  "R$ 89.90",
    features: [
        ` Até ${Plans.BASIC.maxServices} serviços`,
        `Agendamentos limitados`, 
        ` Suporte`,
        ` Relatorios`,

    ]

    }


, {
    id: "PROFESSIONAL",
    name:"PROFESSIONAL",
    description:" Peefeito para clinicas grandes",
    oldPrice: "R$ 199,00",
    price:  "R$ 149.90",
    features: [
        ` Até ${Plans.PROFESSIONAL.maxServices} serviços`,
        `Agendamentos ilimitados`, 
        ` Suporte prioritário`,
        ` Relatorios com IA`,
    ]

    },
]