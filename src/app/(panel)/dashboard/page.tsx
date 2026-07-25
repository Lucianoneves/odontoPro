import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";





export default async function Dashboard() {
  const session = await getSession();

  // Sem sessão → volta para a home (protegendo o painel)
  if (!session) {
    redirect("/");
  }
 
  return (
    <div>
      <h1>Pagina Dashboard</h1> 

      <div className="flex fl"></div>
      <div className="flex flex-col gap-4"></div>
      <div className="flex flex-col gap-4"></div>
    </div>
  );
}