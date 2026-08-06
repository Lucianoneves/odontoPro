import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import Google from "next-auth/providers/google"
import { isCustomCloudinaryAvatar } from "@/utils/get-valid-image-src"
import { PrismaClient } from "@prisma/client"
// Standby — descomente para reativar login GitHub:
// import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Standby — GitHub
    // GitHub({
    //   clientId: process.env.AUTH_GITHUB_ID!,
    //   clientSecret: process.env.AUTH_GITHUB_SECRET!,
    //   allowDangerousEmailAccountLinking: true,
    // }),
  ],
  callbacks: {
    /**
     * No login Google, grava a foto do perfil do Google em User.image
     * (exceto se o usuário já tiver avatar customizado no Cloudinary).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.id) {
        return true
      }

      const googlePicture =
        (profile as { picture?: string } | undefined)?.picture ||
        user.image ||
        null

      if (!googlePicture) {
        return true
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { image: true },
        })

        // Não sobrescreve foto enviada pelo usuário no Cloudinary
        if (isCustomCloudinaryAvatar(dbUser?.image)) {
          return true
        }

        if (dbUser?.image !== googlePicture) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: googlePicture },
          })
        }
      } catch (error) {
        console.error("Falha ao sincronizar foto do Google:", error)
      }

      return true
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
})
