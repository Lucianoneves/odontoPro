/**
 * Aceita URLs remotas válidas para next/image
 * (Cloudinary, Google e GitHub). Paths locais /uploads são ignorados.
 */
export function getValidImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;

  const value = src.trim();
  if (!value) return null;

  if (
    value.startsWith("https://res.cloudinary.com/") ||
    value.startsWith("https://avatars.githubusercontent.com/") ||
    value.startsWith("https://lh3.googleusercontent.com/") ||
    value.startsWith("https://lh4.googleusercontent.com/") ||
    value.startsWith("https://lh5.googleusercontent.com/") ||
    value.startsWith("https://lh6.googleusercontent.com/")
  ) {
    return value;
  }

  return null;
}

/** Avatar customizado enviado pelo usuário (Cloudinary) — não sobrescrever no login OAuth */
export function isCustomCloudinaryAvatar(src: string | null | undefined) {
  return !!src?.startsWith("https://res.cloudinary.com/");
}
