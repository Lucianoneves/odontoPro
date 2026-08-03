"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { isSlotSequenceAvailable } from "./schedule-utils";
import {
    getBlockedSlotsForDate,
    parseAppointmentDate,
} from "./appointment-slot-helpers";

const formSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email é obrigatório" }),
    phone: z.string().min(1, { message: "Telefone é obrigatório" }),
    date: z.string().min(1, { message: "Data é obrigatório" }),
    serviceId: z.string().min(1, { message: "Serviço é obrigatório" }),
    time: z.string().min(1, { message: "Horário é obrigatório" }),
    clinicId: z.string().min(1, { message: "Clínica é obrigatório" }),
});

type FormSchema = z.infer<typeof formSchema>;

export async function CreateNewAppointments(formData: FormSchema) {
    const schema = formSchema.safeParse(formData);

    if (!schema.success) {
        return {
            error: schema.error.issues[0].message,
        };
    }

    try {
        const service = await prisma.service.findFirst({
            where: {
                id: formData.serviceId,
                userId: formData.clinicId,
            },
        });

        if (!service) {
            return {
                error: "Serviço não encontrado",
            };
        }

        const { times, blockedSlots, appointments } =
            await getBlockedSlotsForDate(formData.clinicId, formData.date);

        const sameServiceAndTime = appointments.find(
            (appointment) =>
                appointment.serviceId === formData.serviceId &&
                appointment.time === formData.time
        );

        if (sameServiceAndTime) {
            return {
                error: "Já existe um agendamento deste serviço neste horário. Escolha outro horário.",
            };
        }

        const requiredSlots = Math.ceil(service.duration / 30);
        const canBook = isSlotSequenceAvailable(
            formData.time,
            requiredSlots,
            times,
            blockedSlots
        );

        if (!canBook) {
            return {
                error: "Este horário já está ocupado. Escolha outro horário.",
            };
        }

        const appointmentDate = parseAppointmentDate(formData.date);

        const newAppointment = await prisma.appointments.create({
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                serviceId: formData.serviceId,
                appointmentDate: appointmentDate,
                time: formData.time,
                userId: formData.clinicId,
            },
        });

        return {
            data: newAppointment,
        };
    } catch (error) {
        console.error(error);
        return {
            error: "Erro ao cadastrar o agendamento",
        };
    }
}
