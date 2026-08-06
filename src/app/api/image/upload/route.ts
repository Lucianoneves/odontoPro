import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  isNetworkError,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

/**
 * POST /api/image/upload
 * 1) Envia o arquivo para o Cloudinary
 * 2) Salva somente a URL em User.image
 */
export const POST = async (request: Request) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado. Faça login novamente." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Arquivo ou usuário inválido" },
        { status: 400 }
      );
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato de imagem inválido. Use PNG ou JPEG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Imagem muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    const uploaded = await uploadImageToCloudinary({
      file,
      publicId: `odontopro/avatars/${userId}`,
    });

    // Banco guarda só a URL — nunca o arquivo
    await prisma.user.update({
      where: { id: userId },
      data: { image: uploaded.url },
    });

    revalidatePath("/dashboard/profile");

    return NextResponse.json({
      message: "Imagem enviada com sucesso",
      url: uploaded.url,
      provider: "cloudinary",
      mode: uploaded.mode,
    });
  } catch (error) {
    console.error("Erro no upload Cloudinary", error);

    if (isNetworkError(error)) {
      return NextResponse.json(
        {
          error:
            "Não foi possível conectar ao Cloudinary (timeout de rede). Verifique internet/VPN e tente novamente.",
        },
        { status: 503 }
      );
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro ao enviar imagem para o Cloudinary";

    const lower = message.toLowerCase();

    if (lower.includes("upload preset not found")) {
      return NextResponse.json(
        {
          error:
            'Preset "odontopro_avatars" não encontrado. Crie em Cloudinary → Settings → Upload → Upload presets (Signing mode: Unsigned) e reinicie o servidor.',
        },
        { status: 500 }
      );
    }

    if (
      lower.includes("missing permissions") ||
      lower.includes("not allowed") ||
      lower.includes("403")
    ) {
      return NextResponse.json(
        {
          error:
            "API Key sem permissão de upload. Em Settings → API Keys → Assign Roles (Master Admin), ou use CLOUDINARY_UPLOAD_PRESET unsigned.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
};
