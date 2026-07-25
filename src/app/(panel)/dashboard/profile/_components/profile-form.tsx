"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, type UserFormData } from "@/lib/validations/user";
import { useForm } from "react-hook-form";
import {z} from "zod" 

interface UseProfileFormProps {
  name: string | null;
  address: string | null;
  phone: string | null;
  status: boolean ;
  timeZone: string | null;
}



const profileSchema = z.object({
    name: z.string().min(1, {message: "Nome é obrigatório",}),
    address:z.string().min(1, {message: "Endereço é obrigatório",}),
    phone:z.string().min(1, {message: "Telefone é obrigatório",}),
    status:z.string().min(1, {message: "Status é obrigatório",}), 
    timeZone:z.string().min(1, {message: "Time Zone é obrigatório",}),
   })

  export  type ProfileFormData = z.infer<typeof profileSchema>;

   export  function useProfileForm({name, address, phone, status, timeZone}: UseProfileFormProps) { // hook para o formulario de perfil do usuario
    return useForm <ProfileFormData> ({     // useForm é um hook do react-hook-form que retorna um objeto com os métodos para gerenciar o formulário
        resolver: zodResolver(profileSchema), // zodResolver é um resolver do zod que retorna um objeto com os métodos para validar o formulário
        defaultValues: {
            name: name || "",
            address: address || "",
            phone: phone || "",
            status: status? "active" : "inactive",
            timeZone: timeZone || ""
        },
          
    })    
    }
   

  

  

