import { redirect } from "next/navigation";
import { getPermissionUserToReports } from "./_data-access/get-permission-reports";
import getSession from "@/lib/getSession";



export default async function Reports() {

    const session = await getSession();

    // Sem sessão → volta para a home (protegendo o painel)
    if (!session) {
        redirect("/");
    }

    const user = await getPermissionUserToReports({ userId: session.user?.id! ?? "" });

    if (!user) {
        return (
            <main>
                <h1> Você não tem permissão para acessar esta página</h1>
                <p> Assine o plano Professional para acessar esta página</p>
            </main>
        )
    }

    return (
        <main>
            <h1> Pagina de Relatórios</h1>
        </main>
    )
}