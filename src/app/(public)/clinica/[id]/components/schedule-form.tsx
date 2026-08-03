"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const appointmentSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    phone: z.string().min(1, { message: "Telefone é obrigatório" }),
    date: z.string().min(1, { message: "Data é obrigatória" }),
    service: z.string().min(1, { message: "Serviço é obrigatório" }),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function useAppointmentForm() {
    return useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            date: getTodayDateString(),
            service: "",
        },
    });
}
