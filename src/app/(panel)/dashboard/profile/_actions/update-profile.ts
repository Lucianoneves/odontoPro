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
    const userId = session.user?.id;

    if (!userId) {
      return { error: "Usuário não autenticado" };
    }

    await prisma.user.update({
        where: {
            id: userId
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

    revalidatePath("/dashboard/profile");
    revalidatePath(`/clinica/${userId}`);
    revalidatePath("/dashboard");
    revalidatePath("/"); // home com lista de clínicas

    return{
        success: "Clinica atualizado com sucesso"
    }
   }catch(error){
    console.error("Erro ao atualizar perfil:", error);
    return{
        error: "Erro ao atualizar a clinica. Verifique o DATABASE_URL no Vercel."
    }


}  
}

