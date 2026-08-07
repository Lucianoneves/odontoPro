import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getInfoSchedule } from "./_data_access/get-info-schedule";
import { ScheduleContent } from "./components/schedule-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const userId = (await params).id;
  const user = await getInfoSchedule(userId);

  if (!user) {
    redirect("/");
  }

  return (
    <ScheduleContent
      key={`${user.id}-${user.updatedAt.toISOString()}`}
      clinic={user}
    />
  );
}
