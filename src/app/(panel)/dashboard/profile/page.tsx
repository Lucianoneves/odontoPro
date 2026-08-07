import { connection } from "next/server";
import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { getUserData } from "./_data-access/get-info-user";
import { ProfileContent } from "./_components/profile";

// Garante que a página NÃO vira HTML estático no build da Vercel
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ProfilePage() {
  // Marca a request como dinâmica (Next.js 15+)
  await connection();

  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = await getUserData({ userId: session?.user?.id ?? "" });

  if (!user) {
    redirect("/");
  }

  return (
    <ProfileContent
      key={`${user.id}-${user.updatedAt.toISOString()}`}
      user={user}
    />
  );
}
