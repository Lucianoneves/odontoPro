"use server"


import { signIn } from "@/lib/auth" 
import { redirect } from "next/navigation"


export async function handleRegister( provider: string) { 
await signIn (provider, { redirect: true, redirectTo: "/dashboard" })
}
  