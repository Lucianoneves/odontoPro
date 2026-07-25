"use server"; 

import { auth } from "@/lib/auth";
import { z } from "zod"; 
import  prisma  from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";


const formSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    price: z.number().min(1, { message: "Preço é obrigatório" }),
    duration: z.number()
})


type FormSchema = z.infer<typeof formSchema>; 


export async function createService(formData: FormSchema) { 
    const session = await auth()


    if(!session?.user) {
        return {
            error: "Falha  ao cadastrar serviço" 
        }
    }

    const schema = formSchema.safeParse(formData);

    if(!schema.success) { // Se o formulário não for válido, retorna o erro
        return {
            error:  schema.error.issues[0].message 
        }
    }

    try { 

        const newService = await prisma.service.create({
            data: {
                name: formData.name,
                price: formData.price,
                duration: formData.duration,
                userId: session?.user.id
            }
        })

        revalidatePath("/dashboard/services");

        return {
            data: newService,
            success: "Serviço cadastrado com sucesso" 
        }
                
            
        

    } catch (error) {
        console.error(error);
        return {
            error: "Falha  ao cadastrar serviço" 
        }
    }
}