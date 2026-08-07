"use server";

import { unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/prisma";

export async function getProfessionais() {
  noStore();

  try {
    const professionais = await prisma.user.findMany({
      where: {
        status: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return professionais;
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return [];
  }
}
