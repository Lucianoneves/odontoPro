"use server"; 


import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const formSchema = z.object({
    appointmentId: z.string().min(1, "Você precisa selecionar um agendamento "),
});

type FormData = z.infer<typeof formSchema>; 

export async function cancelAppointment(formData: FormData) {  // o formData é o objeto que contém os dados do formulário


    const schema = formSchema.safeParse(formData); // o safeParse é um metodo do zod para validar os dados do formulário

    if(!schema.success) {
        return {
            error: schema.error.issues[0].message,
        };
    }

    const session = await auth(); 

    if(!session?.user?.id) {
        return {
            error: "Você precisa estar autenticado para cancelar um agendamento",
        };
    } 

    try{

        await prisma.appointments.delete({ // o delete é um metodo do prisma para deletar um registro no banco de dados
            where: {
                id: formData.appointmentId,
                userId: session.user.id,
            },
        });

        revalidatePath("/dashboard");

        return { 
            data: "Agendamento cancelado com sucesso",
        };

    }catch(error){
        console.error(error);
        return {
            error: "Erro ao cancelar agendamento",
        };
    }

}