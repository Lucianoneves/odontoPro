import { getReminders } from "../../_date-access/get-reminders";
import { ReminderList } from "./reminder-list";




export async function Reminders({userId}: {userId: string}) { // userId é o id da clínica

    const reminders = await getReminders({userId}); 

   
  
    return (
        <ReminderList reminder={reminders} />
    )
}