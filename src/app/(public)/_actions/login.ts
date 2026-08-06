"use server"

import { signIn } from "@/lib/auth"

/** Provider ativo de login. GitHub está em standby. */
export type LoginProvider = "google"

export async function handleRegister(provider: LoginProvider = "google") {
  await signIn(provider, {
    redirect: true,
    redirectTo: "/dashboard",
  })
}
