"use server"  // server action para atualizar o perfil do usuario 

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"



const formSchema = z.object({
    name: z.string().min(1, {message: "Nome é obrigatório",}),
    address:z.string().optional(),
    phone:z.string().optional(),
    status:z.boolean(), 
    timeZone:z.string(),
    times:z.array(z.string())
   })

   type FormSchema = z.infer<typeof formSchema>;

export async function updateProfile (formData: FormSchema){ 


     const session = await auth();

     if(!session){
        return{
            error: " usuario nao esta autenticado"
        }
     }

    const schema = formSchema.safeParse(formData); 


    if(!schema.success){
        return{
            error: "Preencha todos os campos obrigatórios"  
            
        } 

    }

   try { 
    await prisma.user.update({ // atualizando o perfil do usuario no banco de dados 
        where: {
            id: session.user?.id ?? ""
        },
        data: {
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            status: formData.status,
            timeZone: formData.timeZone,
            times: formData.times || []
        }
    })

    revalidatePath("/dashboard/profile"); // refazendo a pagina para atualizar o perfil do usuario 

    return{
        success: "Clinica atualizado com sucesso"
    }
   }catch(error){
    return{
        error: "Erro ao atualizar a clinica"
    }


}  
}

