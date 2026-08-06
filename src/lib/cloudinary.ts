/**
 * Configuração Cloudinary.
 * Imagens ficam no Cloudinary; no banco salvamos apenas a URL (User.image).
 */

function cleanEnv(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

function isPlaceholder(value: string) {
  const v = value.toLowerCase();
  return (
    v.includes("your_api") ||
    v.includes("your_secret") ||
    v.includes("your_cloud") ||
    v.includes("<") ||
    v.includes(">") ||
    v.includes("changeme") ||
    v.includes("xxxx")
  );
}

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
};

export function getCloudinaryConfig(): CloudinaryConfig {
  const fromVars = {
    cloudName: cleanEnv(process.env.CLOUDINARY_NAME),
    apiKey: cleanEnv(process.env.CLOUDINARY_KEY),
    apiSecret: cleanEnv(process.env.CLOUDINARY_SECRET),
    uploadPreset: cleanEnv(process.env.CLOUDINARY_UPLOAD_PRESET),
  };

  const varsOk =
    fromVars.cloudName &&
    fromVars.apiKey &&
    fromVars.apiSecret &&
    !isPlaceholder(fromVars.cloudName) &&
    !isPlaceholder(fromVars.apiKey) &&
    !isPlaceholder(fromVars.apiSecret);

  if (varsOk) {
    return fromVars;
  }

  const url = cleanEnv(process.env.CLOUDINARY_URL);

  if (url.startsWith("cloudinary://") && !isPlaceholder(url)) {
    try {
      const parsed = new URL(url);
      const cloudName = parsed.hostname;
      const apiKey = decodeURIComponent(parsed.username);
      const apiSecret = decodeURIComponent(parsed.password);

      if (
        cloudName &&
        apiKey &&
        apiSecret &&
        !isPlaceholder(cloudName) &&
        !isPlaceholder(apiKey) &&
        !isPlaceholder(apiSecret)
      ) {
        return {
          cloudName,
          apiKey,
          apiSecret,
          uploadPreset: fromVars.uploadPreset,
        };
      }
    } catch {
      // continua
    }
  }

  return fromVars;
}

export function canUseSignedUpload(config: CloudinaryConfig) {
  return (
    !!config.cloudName &&
    !!config.apiKey &&
    !!config.apiSecret &&
    !isPlaceholder(config.apiKey) &&
    !isPlaceholder(config.apiSecret)
  );
}

export function isNetworkError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    name?: string;
    message?: string;
    cause?: { code?: string; message?: string };
  };

  const code = err.cause?.code ?? "";
  const message = `${err.name ?? ""} ${err.message ?? ""} ${err.cause?.message ?? ""}`.toLowerCase();

  return (
    err.name === "AbortError" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    message.includes("fetch failed") ||
    message.includes("connect timeout") ||
    message.includes("aborted")
  );
}

export function extractCloudinaryError(
  data: unknown,
  headers: Headers,
  status: number
) {
  const headerError =
    headers.get("x-cld-error") ||
    headers.get("X-Cld-Error") ||
    headers.get("x-cld-error-message");

  if (headerError) return headerError;

  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error?: { message?: string } | string }).error;
    if (typeof err === "string" && err.trim()) return err;
    if (err && typeof err === "object" && typeof err.message === "string") {
      return err.message;
    }
  }

  return `Cloudinary recusou o upload (HTTP ${status})`;
}

async function parseJsonResponse(response: Response) {
  const rawText = await response.text();
  let data: Record<string, unknown> = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { raw: rawText };
  }

  return data;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        return await fetch(url, {
          ...init,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error) || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError;
}

export type CloudinaryUploadResult = {
  url: string;
  mode: "unsigned_preset" | "basic_auth";
};

/**
 * Envia o arquivo para o Cloudinary e devolve apenas a secure_url.
 * Preferência: upload preset unsigned → Basic Auth com API Key/Secret.
 */
export async function uploadImageToCloudinary(params: {
  file: File;
  publicId: string;
}): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();

  if (!config.cloudName) {
    throw new Error("CLOUDINARY_NAME não configurado no .env");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  if (config.uploadPreset) {
    const form = new FormData();
    form.append("file", params.file);
    form.append("upload_preset", config.uploadPreset);
    form.append("public_id", params.publicId);

    const response = await fetchWithRetry(endpoint, {
      method: "POST",
      body: form,
    });
    const data = await parseJsonResponse(response);

    if (response.ok && typeof data.secure_url === "string") {
      return { url: data.secure_url, mode: "unsigned_preset" };
    }

    const message = extractCloudinaryError(data, response.headers, response.status);

    // Se o preset falhar e houver key/secret, tenta signed
    if (!canUseSignedUpload(config)) {
      throw new Error(message);
    }

    console.warn("Upload unsigned falhou, tentando Basic Auth:", message);
  }

  if (!canUseSignedUpload(config)) {
    throw new Error(
      "Configure CLOUDINARY_UPLOAD_PRESET ou CLOUDINARY_KEY/SECRET no .env"
    );
  }

  const form = new FormData();
  form.append("file", params.file);
  form.append("public_id", params.publicId);
  form.append("overwrite", "true");
  form.append("invalidate", "true");

  const credentials = Buffer.from(
    `${config.apiKey}:${config.apiSecret}`
  ).toString("base64");

  const response = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    body: form,
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || typeof data.secure_url !== "string") {
    throw new Error(
      extractCloudinaryError(data, response.headers, response.status)
    );
  }

  return { url: data.secure_url, mode: "basic_auth" };
}
