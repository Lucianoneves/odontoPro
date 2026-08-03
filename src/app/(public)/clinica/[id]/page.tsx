import { redirect } from "next/navigation";
import { getInfoSchedule } from "./_data_access/get-info-schedule";
import { ScheduleContent } from "./components/schedule-content";


export default async function SchdedulePage({
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

