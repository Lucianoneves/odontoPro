"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const formSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
});

type FormData = z.infer<typeof formSchema>; 


export async function createReminder(formData: FormData) { 

    const session = await auth();

    if(!session?.user?.id) {
        return {
            error: "Falha ao criar lembrete",
        };
    }


    
    const schema = formSchema.safeParse(formData);

    if (!schema.success) {
        return {
            error: schema.error.issues[0].message,
        };
    }

    try {
        await prisma.reminder.create({
            data: {
                description: formData.description,
                userId:session?.user?.id,
                
            },
        });

        revalidatePath("/dashboard");

        
    } catch (error) {
        console.error(error);
        return {
            error: "Erro ao criar lembrete",
        };
    }
}