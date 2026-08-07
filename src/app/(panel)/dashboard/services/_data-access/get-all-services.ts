"use server";
import prisma from "@/lib/prisma";

 


export async function getAllServices({userId}: {userId: string}) { // funcao para buscar todos os servicos do usuario
    
   if(!userId){
    return{
        error: "Usuario nao encontrado",
    }
   }


  try { 
    const services = await prisma.service.findMany({ // Busca todos os servicos do usuario
        where: {
            userId: userId,
            status: true, 
        },
    });

  return{ 
    data: services,

  }
} catch (error) {
    return{
        error: "Erro ao buscar servicos",
    }
}
}