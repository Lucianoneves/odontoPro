"use server"; 

import prisma from "@/lib/prisma"; 


export async function getProfessionais() { // função para buscar todos os profissionais

    try{

        const professionais = await prisma.user.findMany({ // busca todos os profissionais
            where: {
                status:true
                 
            }
        })

        return professionais;
    }catch(error){ 
        return [];

}
}