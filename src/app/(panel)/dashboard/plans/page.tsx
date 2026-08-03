import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { GridPlans } from "./_components/grid-plans";


export default async function PlansPage() {  // pagina de planos para assinaturas
    const session = await getSession(); // sessão do usuario

   
    if (!session) {
      redirect("/"); 
    }
    return (
        <div>
            <GridPlans />
        </div>
    )
}