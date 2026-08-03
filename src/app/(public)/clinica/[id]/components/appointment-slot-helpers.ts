import prisma from "@/lib/prisma";
import { generateTimeSlots } from "@/utils/generate-time-slots";

export function parseAppointmentDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function getBlockedSlotsForDate(
    clinicId: string,
    date: string,
    excludeAppointmentId?: string
) {
    const appointmentDate = parseAppointmentDate(date);
    const endDate = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        23,
        59,
        59,
        999
    );

    const existingAppointments = await prisma.appointments.findMany({
        where: {
            userId: clinicId,
            appointmentDate: {
                gte: appointmentDate,
                lte: endDate,
            },
            ...(excludeAppointmentId
                ? { id: { not: excludeAppointmentId } }
                : {}),
        },
        include: {
            service: true,
        },
    });

    const times = generateTimeSlots();
    const blockedSlots = new Set<string>();

    for (const appointment of existingAppointments) {
        const occupiedSlots = Math.ceil(
            (appointment.service?.duration ?? 30) / 30
        );
        const startIndex = times.indexOf(appointment.time);

        if (startIndex === -1) {
            continue;
        }

        for (let i = 0; i < occupiedSlots; i++) {
            const blockedSlot = times[startIndex + i];
            if (blockedSlot) {
                blockedSlots.add(blockedSlot);
            }
        }
    }

    return {
        times,
        blockedSlots: Array.from(blockedSlots),
        appointments: existingAppointments,
    };
}
