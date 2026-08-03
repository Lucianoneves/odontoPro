"use server"; 



import  prisma from "@/lib/prisma"; 


export async function getInfoSchedule(userId: string) { 
    try{
        if(!userId) {
            return null
    }

    const user = await prisma.user.findFirst ({ /* busco el usuario por su id */
        where: {
            id: userId 
        },
        include: {
            subscription: true,
            services: {
                where: {
                    status: true
                }
            }

            },
        });  

        if(!user) { 
            return null;
        }

        return user; 

    }catch (error) { 
        console.error("Erro ao buscar clinica:", error);
        return null;
    } 
}