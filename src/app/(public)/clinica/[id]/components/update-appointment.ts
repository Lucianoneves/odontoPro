"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import {
    getBlockedSlotsForDate,
    parseAppointmentDate,
} from "./appointment-slot-helpers";
import { isSlotSequenceAvailable } from "./schedule-utils";

const updateSchema = z.object({
    appointmentId: z.string().min(1),
    email: z.string().email(),
    clinicId: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    serviceId: z.string().min(1),
});

type UpdateSchema = z.infer<typeof updateSchema>;

export async function getClientAppointments(clinicId: string, email: string) {
    if (!clinicId || !email) {
        return { error: "Informe o email para buscar o agendamento." };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointments.findMany({
            where: {
                userId: clinicId,
                email: {
                    equals: email.trim().toLowerCase(),
                    mode: "insensitive",
                },
                appointmentDate: {
                    gte: today,
                },
            },
            include: {
                service: true,
            },
            orderBy: [{ appointmentDate: "asc" }, { time: "asc" }],
        });

        return { data: appointments };
    } catch (error) {
        console.error(error);
        return { error: "Erro ao buscar agendamentos." };
    }
}

export async function UpdateAppointmentTime(formData: UpdateSchema) {
    const schema = updateSchema.safeParse(formData);

    if (!schema.success) {
        return { error: schema.error.issues[0].message };
    }

    try {
        const appointment = await prisma.appointments.findFirst({
            where: {
                id: formData.appointmentId,
                userId: formData.clinicId,
                email: {
                    equals: formData.email.trim().toLowerCase(),
                    mode: "insensitive",
                },
            },
            include: {
                service: true,
            },
        });

        if (!appointment) {
            return { error: "Agendamento não encontrado." };
        }

        const service = await prisma.service.findFirst({
            where: {
                id: formData.serviceId,
                userId: formData.clinicId,
            },
        });

        if (!service) {
            return { error: "Serviço não encontrado." };
        }

        const { times, blockedSlots, appointments } =
            await getBlockedSlotsForDate(
                formData.clinicId,
                formData.date,
                formData.appointmentId
            );

        const sameServiceAndTime = appointments.find(
            (item) =>
                item.serviceId === formData.serviceId &&
                item.time === formData.time
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

        const updated = await prisma.appointments.update({
            where: {
                id: formData.appointmentId,
            },
            data: {
                appointmentDate: parseAppointmentDate(formData.date),
                time: formData.time,
                serviceId: formData.serviceId,
            },
        });

        return { data: updated };
    } catch (error) {
        console.error(error);
        return { error: "Erro ao alterar o agendamento." };
    }
}
