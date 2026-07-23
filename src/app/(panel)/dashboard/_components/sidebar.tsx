"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Banknote,
    CalendarCheck2,
    ChevronLeft,
    ChevronRight,
    Folder,
    List,
    Settings,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../../../../public/logo-odonto.png";

export function SidebarDashboard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen w-full">
            {/* Sidebar desktop — escondida no mobile */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-20 hidden flex-col border-r bg-white px-3 transition-all duration-300 md:flex",
                    {
                        "w-20": isCollapsed,
                        "w-64": !isCollapsed,
                    }
                )}
            >
                <div className="mb-4 mt-4 flex items-center justify-between">
                    {!isCollapsed && (
                        <Image
                            src={logoImg}
                            alt="Logo OdontoPRO"
                            priority
                            quality={100}
                            style={{ width: "auto", height: "auto" }}
                        />
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 bg-gray-100 text-zinc-900 hover:bg-gray-50"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </Button>

                {/* Mostrar somente quando a sidbar esta recolhida* */}

                {isCollapsed && (
                     <nav className="flex flex-col gap-2 overflow-hidden pt-2 text-base">

                      <SidebarLink
                        href="/dashboard/patients"
                        label="Pacientes"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<CalendarCheck2 className="h-6 w-6" />}
                    />
                    <SidebarLink
                        href="/dashboard/services"
                        label="Serviços"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Folder className="h-6 w-6" />}
                    />

                    <SidebarLink
                        href="/dashboard/profile"
                        label="Meu perfil"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Settings className="h-6 w-6" />}
                    />
                    <SidebarLink
                        href="/dashboard/plans"
                        label="Planos"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Banknote className="h-6 w-6" />}
                    />



                     </nav>

                )}




                </div>

                <nav className="flex flex-col gap-2 overflow-hidden pt-2 text-base">
                    {!isCollapsed && (
                        <span className="mt-1 text-sm font-medium text-gray-400 uppercase">
                            Painel
                        </span>
                    )}

                    <SidebarLink
                        href="/dashboard"
                        label="Agendamentos"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<CalendarCheck2 className="h-6 w-6" />}
                    />
                    <SidebarLink
                        href="/dashboard/services"
                        label="Serviços"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Folder className="h-6 w-6" />}
                    />

                    {!isCollapsed && (
                        <span className="mt-1 text-sm font-medium text-gray-400 uppercase">
                            Configurações
                        </span>
                    )}

                    <SidebarLink
                        href="/dashboard/profile"
                        label="Meu perfil"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Settings className="h-6 w-6" />}
                    />
                    <SidebarLink
                        href="/dashboard/plans"
                        label="Planos"
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        icon={<Banknote className="h-6 w-6" />}
                    />
                </nav>
            </aside>

            <div
                className={clsx(
                    "flex flex-1 flex-col transition-all duration-300",
                    {
                        "md:ml-20": isCollapsed,
                        "md:ml-64": !isCollapsed,
                    }
                )}
            >
                {/* Header mobile com botão do menu */}
                <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-2 md:hidden">
                    <Sheet>
                        <div className="flex items-center gap-4">
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="Abrir menu"
                                    />
                                }
                            >
                                <List className="h-5 w-5" />
                            </SheetTrigger>

                            <h1 className="text-base font-semibold">
                                Menu OdontoPRO
                            </h1>
                        </div>

                        <SheetContent
                            side="left"
                            className="w-70 bg-white text-black sm:max-w-xs"
                        >
                            <SheetTitle>OdontoPRO</SheetTitle>
                            <SheetDescription>
                                Menu administrativo
                            </SheetDescription>

                            <nav className="grid gap-2 pt-5 text-base">
                                <SidebarLink
                                    href="/dashboard"
                                    label="Agendamentos"
                                    pathname={pathname}
                                    isCollapsed={false}
                                    icon={
                                        <CalendarCheck2 className="h-6 w-6" />
                                    }
                                />
                                <SidebarLink
                                    href="/dashboard/services"
                                    label="Serviços"
                                    pathname={pathname}
                                    isCollapsed={false}
                                    icon={<Folder className="h-6 w-6" />}
                                />
                                <SidebarLink
                                    href="/dashboard/profile"
                                    label="Meu perfil"
                                    pathname={pathname}
                                    isCollapsed={false}
                                    icon={<Settings className="h-6 w-6" />}
                                />
                                <SidebarLink
                                    href="/dashboard/plans"
                                    label="Planos"
                                    pathname={pathname}
                                    isCollapsed={false}
                                    icon={<Banknote className="h-6 w-6" />}
                                />
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 px-2 py-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    pathname: string;
    isCollapsed: boolean;
}

function SidebarLink({
    href,
    icon,
    isCollapsed,
    label,
    pathname,
}: SidebarLinkProps) {
    return (
        <Link href={href}>
            <div
                className={clsx(
                    "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                    {
                        "bg-blue-500 text-white": pathname === href,
                        "text-gray-700 hover:bg-gray-100": pathname !== href,
                        "justify-center": isCollapsed,
                    }
                )}
            >
                <span className="h-6 w-6 shrink-0">{icon}</span>
                {!isCollapsed && <span>{label}</span>}
            </div>
        </Link>
    );
}
