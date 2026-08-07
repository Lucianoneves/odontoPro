import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { getUserData } from "./_data-access/get-info-user";
import { ProfileContent } from "./_components/profile";

// Em produção (Vercel) evita cache estático de dados do perfil
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = await getUserData({ userId: session?.user?.id ?? "" });

  if (!user) {
    redirect("/");
  }

  return <ProfileContent user={user} />;
}
