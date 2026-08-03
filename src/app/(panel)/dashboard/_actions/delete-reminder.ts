"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const formSchema = z.object({
    reminderId: z.string().min(1, "ID do lembrete é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export async function deleteReminder(formData: FormData) {
    const schema = formSchema.safeParse(formData);

    if (!schema.success) {
        return {
            error: schema.error.issues[0].message,
        };
    }

    try {
        await prisma.reminder.delete({
            where: {
                id: schema.data.reminderId,
            },
        });

        revalidatePath("/dashboard");

        return {
            success: "Lembrete deletado com sucesso",
        };
    } catch (error) {
        console.error(error);
        return {
            error: "Erro ao deletar lembrete",
        };
    }
}
