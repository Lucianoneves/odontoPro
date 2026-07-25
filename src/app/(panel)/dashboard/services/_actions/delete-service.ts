"use server"; 


import { auth } from "@/lib/auth";
import { z } from "zod"; 
import  prisma  from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";


const formSchema = z.object({
     serviceId: z.string().min(1, { message: "Serviço é obrigatório" }),
})


type FormSchema = z.infer<typeof formSchema>; 


export async function deleteService(formData: FormSchema) { // Função para deletar um serviço
    const session = await auth();

    if(!session?.user) {
        return {
            error: "Falha ao deletar serviço"
        }
    }

    const schema = formSchema.safeParse(formData);

    if(!schema.success) {
        return {
            error: schema.error.issues[0].message
}
} 

try {
    await prisma.service.update({
        where: { 
            id: formData.serviceId,
        userId: session.user.id,
     },
     data: {
        status: false
     }
    })

    revalidatePath("/dashboard/services");

    return {
        data: "Serviço deletado com sucesso"
    }

}catch(error){
    return {
        error: "Falha ao deletar serviço"
    }
}
}