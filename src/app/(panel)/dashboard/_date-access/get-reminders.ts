"use server";  


import prisma from "@/lib/prisma"; 


export async function getReminders( {userId}: {userId: string}) { // userId é o id da clínica

    if(!userId) {
        return [];
    }

    try{

        const reminders = await prisma.reminder.findMany({ // busca todos os lembretes da clínica
            where: {
                userId: userId,
            },
            
        });
        return reminders;

    }catch(error) {
        console.error(error);
        return [];
    }


}