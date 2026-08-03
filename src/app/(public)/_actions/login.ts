"use server"


import { signIn } from "@/lib/auth" 
import { redirect } from "next/navigation"


export async function handleRegister( provider: string) {  // função para fazer login com o provider
    await signIn (provider, { redirect: true, redirectTo: "/dashboard" }) // faz o login com o provider e redireciona para a dashboard
}
  