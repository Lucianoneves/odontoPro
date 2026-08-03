import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Rota para buscar os agendamentos da clínica por data

export const GET = auth(async function GET(request) {
    if (!request.auth) {
        return NextResponse.json(
            { error: "Não autenticado" },
            { status: 401 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const dateString = searchParams.get("date"); // esperado: YYYY-MM-DD
    const clinicId = request.auth?.user?.id;

    if (!dateString) {
        return NextResponse.json(
            { error: "Data não encontrada" },
            { status: 400 }
        );
    }

    if (!clinicId) {
        return NextResponse.json(
            { error: "Clínica não encontrada" },
            { status: 400 }
        );
    }

    try {
        // Data vem como "2026-07-30" → separar por hífen
        const [year, month, day] = dateString.split("-").map(Number);

        if (!year || !month || !day) {
            return NextResponse.json(
                { error: "Data inválida. Use o formato YYYY-MM-DD" },
                { status: 400 }
            );
        }

        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        const appointments = await prisma.appointments.findMany({
            where: {
                userId: clinicId,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                service: true,
            },
            orderBy: {
                time: "asc",
            },
        });

        console.log("Agendamentos encontrados:", appointments);

        return NextResponse.json(appointments);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar agendamentos" },
            { status: 500 }
        );
    }
});
