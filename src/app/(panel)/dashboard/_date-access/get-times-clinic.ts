"use server";

import prisma from "@/lib/prisma";
import { generateTimeSlots } from "@/utils/generate-time-slots";

export async function getTimesClinic({ userId }: { userId: string }) {
    if (!userId) {
        return {
            times: [],
            userId: userId,
        };
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                times: true,
            },
        });

        if (!user) {
            return {
                times: [],
                userId: "",
            };
        }

        // Se a clínica não cadastrou horários no perfil, usa a grade padrão
        const times =
            user.times && user.times.length > 0
                ? [...user.times].sort()
                : generateTimeSlots();

        return {
            times,
            userId: user.id,
        };
    } catch (error) {
        console.error(error);
        return {
            times: generateTimeSlots(),
            userId: userId,
        };
    }
}
