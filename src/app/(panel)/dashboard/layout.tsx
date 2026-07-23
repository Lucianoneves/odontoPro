import { SidebarDashboard } from "./_components/sidebar";

export default function DashboardLayout({ // componente de layout para o dashboard  para todas as paginas  serviços,planos e perfis
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
             <SidebarDashboard>
                {children}
             </SidebarDashboard>
          
            
        </>
    )
}