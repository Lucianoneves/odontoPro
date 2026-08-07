import { redirect } from "next/navigation";
import { getInfoSchedule } from "./_data_access/get-info-schedule";
import { ScheduleContent } from "./components/schedule-content";

// Página pública da clínica sempre busca dados atualizados
export const dynamic = "force-dynamic";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = (await params).id;
  const user = await getInfoSchedule(userId);

  if (!user) {
    redirect("/");
  }

  return <ScheduleContent clinic={user} />;
}
