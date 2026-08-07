"use server";

import { unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/prisma";

interface getUserDataProps {
  userId: string;
}

export async function getUserData({ userId }: getUserDataProps) {
  noStore(); // sempre dados frescos (importante na Vercel)

  try {
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return null;
  }
}
