import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { Calendar } from "lucide-react";
import { ButtonCopyLink } from "./_components/button-copy-link";
import { Reminders } from "./_components/reminder/reminders";
import { Appointments } from "./_components/appointments/appointments";




export default async function Dashboard() {
  const session = await getSession();

  // Sem sessão → volta para a home (protegendo o painel)
  if (!session) {
    redirect("/"); 
  }
 
  return (
    <main>
      <div className="space-x-2 flex items-center justify-end">
        <Link 
        href={`/clinica/${session.user.id}`}
        target='_blank'
        >
        <Button className="bg-blue-400 text-white hover:bg-blue-600 md:flex-[0.5] flex-1" > 
          <Calendar className="w-4 h-4" /> 
          <span className="hidden md:block cursor-pointer"> Novo Agendamento </span>
          </Button>
        </Link>
        <ButtonCopyLink userId={session.user.id!} />
      </div>     

      <section className=" grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
        <Appointments userId={session.user.id!} /> 

        <Reminders userId={session.user.id!} />
      </section>
    </main>
  );
}