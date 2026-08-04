"use server"; 

import  prisma  from "@/lib/prisma"; 

export async function getSubscription(userId: string) { // função para buscar a assinatura do usuario

    if(!userId) {
        return null;
    }

    try{
        const subscription = await prisma.subscription.findUnique({ // busca a assinatura do usuario
            where: { 
                userId: userId,
            }, 

        })

        return subscription; // retorna a assinatura do usuario

    } catch (error) {
        
        return null;
    }

}