"use client";

import { useState } from "react";
import Image from "next/image";
import semFoto from "../../../../../../public/foto1.png";
import { Loader, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAvatar } from "../_actions/update-avatar-profile";
import { useSession } from "next-auth/react";
import { getValidImageSrc } from "@/utils/get-valid-image-src";

interface AvatarProfileProps {
  avatarUrl: string | null;
  userId: string;
}

export function AvatarProfile({ avatarUrl, userId }: AvatarProfileProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    getValidImageSrc(avatarUrl)
  );
  const [loading, setLoading] = useState(false);
  const { update } = useSession();

  async function uploadImage(image: File): Promise<string | null> {
    try {
      toast("Enviando imagem...");

      const formData = new FormData();
      formData.append("file", image);
      formData.append("userId", userId);

      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(data.error ?? "Erro ao enviar imagem");
        return null;
      }

      return data.url as string;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar imagem");
      return null;
    }
  }

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const image = event.target.files?.[0];
    if (!image) return;

    if (image.type !== "image/png" && image.type !== "image/jpeg") {
      toast.error("Formato de imagem inválido");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setLoading(true);

    try {
      const extension = image.type === "image/png" ? "png" : "jpg";
      const fileToUpload = new File([image], `${userId}.${extension}`, {
        type: image.type,
      });

      const urlImage = await uploadImage(fileToUpload);

      if (!urlImage) {
        return;
      }

      const result = await updateProfileAvatar({ avatarUrl: urlImage });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setPreviewImage(urlImage);
      await update({ image: urlImage });
      toast.success("Foto atualizada com sucesso");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="relative h-48 w-48 overflow-hidden rounded-full bg-slate-100">
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <span className="pointer-events-none absolute z-2 rounded-full bg-slate-50/80 p-2 shadow-xl">
          {loading ? (
            <Loader size={16} color="#131313" className="animate-spin" />
          ) : (
            <Upload size={16} color="#131313" />
          )}
        </span>

        <input
          type="file"
          accept="image/png,image/jpeg"
          className="absolute inset-0 z-50 h-48 w-48 cursor-pointer opacity-0"
          onChange={handleImageChange}
          disabled={loading}
        />
      </div>

      {previewImage ? (
        <Image
          src={previewImage}
          alt="Foto da clínica"
          fill
          className="rounded-full object-cover"
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          src={semFoto}
          alt="Foto da clínica"
          fill
          className="rounded-full object-cover"
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
}
