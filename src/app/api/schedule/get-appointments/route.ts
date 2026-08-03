import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { generateTimeSlots } from "@/utils/generate-time-slots";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const dateParams = searchParams.get("date");
    const excludeId = searchParams.get("excludeId");

    if (!userId || userId === "null" || !dateParams || dateParams === "null") {
        return NextResponse.json(
            {
                error: "Nenhum agendamento encontrado",
            },
            {
                status: 400,
            }
        );
    }

    try {
        const [year, month, day] = dateParams.split("-").map(Number);
        const startDate = new Date(year, month - 1, day, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: "Usuário não encontrado",
                },
                {
                    status: 404,
                }
            );
        }

        const appointments = await prisma.appointments.findMany({
            where: {
                userId: userId as string,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            include: {
                service: true,
            },
        });

        const times = generateTimeSlots();

        // Montar com todos os (slots) de 30 minutos para o dia selecionado
        const blockedSlots = new Set<string>();
        for (const appointment of appointments) {
            const requiredSlots = Math.ceil(
                (appointment.service?.duration ?? 30) / 30
            );
            const startIndex = times.indexOf(appointment.time);

            if (startIndex !== -1) {
                for (let i = 0; i < requiredSlots; i++) {
                    const blockedSlot = times[startIndex + i];
                    if (blockedSlot) {
                        blockedSlots.add(blockedSlot);
                    }
                }
            }
        }

        const blockedSlotsArray = Array.from(blockedSlots);

        return NextResponse.json(blockedSlotsArray);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                error: "Erro ao buscar agendamentos",
            },
            {
                status: 500,
            }
        );
    }
}
