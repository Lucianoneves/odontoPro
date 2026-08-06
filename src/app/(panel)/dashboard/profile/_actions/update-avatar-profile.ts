"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  avatarUrl: z
    .string()
    .url("URL da imagem inválida")
    .refine(
      (url) =>
        url.startsWith("https://res.cloudinary.com/") ||
        url.startsWith("https://avatars.githubusercontent.com/") ||
        url.startsWith("https://lh3.googleusercontent.com/") ||
        url.startsWith("https://lh4.googleusercontent.com/") ||
        url.startsWith("https://lh5.googleusercontent.com/") ||
        url.startsWith("https://lh6.googleusercontent.com/"),
      {
        message:
          "Somente URLs do Cloudinary, Google ou GitHub são permitidas",
      }
    ),
});

/**
 * Persiste no banco somente a URL da imagem (nunca o arquivo binário).
 */
export async function updateProfileAvatar({
  avatarUrl,
}: {
  avatarUrl: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Usuário não encontrado" };
  }

  const parsed = schema.safeParse({ avatarUrl });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "URL inválida" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: parsed.data.avatarUrl },
    });

    revalidatePath("/dashboard/profile");

    return { data: "Imagem alterada com sucesso" };
  } catch {
    return { error: "Falha ao alterar imagem" };
  }
}
