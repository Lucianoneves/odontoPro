import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod"; // zod é uma biblioteca de validação de schemas
import { useForm } from "react-hook-form";



const formSchema = z.object({ // schema do formulário de serviço
    name: z.string().min(1, {message: "Nome é obrigatório"}),
    price: z.string().min(1, {message: "Preço é obrigatório"}), 
    hours: z.string(),
    minutes: z.string(), 
})

export interface UseDialogServiceFormProps {
    initialValues?:{
        name: string;
        price: string;
        hours: string;
        minutes: string;
    }
    } 

    export type DialogServiceFormData = z.infer<typeof formSchema>;

    export function useDialogServiceForm({ initialValues }: UseDialogServiceFormProps = {}) {
      return useForm<DialogServiceFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            price: initialValues?.price ?? "",
            hours: initialValues?.hours ?? "0",
            minutes: initialValues?.minutes ?? "0",
        },
      });
    }   