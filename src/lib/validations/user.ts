import { z } from "zod";

export const userFormSchema = z.object({ // esquema de validação para o formulario de usuario
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
