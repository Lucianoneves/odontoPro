"use client" // para que o componente seja um client component

import { useState } from "react";
import Link from "next/link";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LogIn, Menu } from "lucide-react"
import { useSession } from "next-auth/react"
import { handleRegister } from "../_actions/login"






export function Header() {
    const{data: session, status} = useSession()
    const [isOpen, setIsOpen] = useState(false); // estado para abrir e fechar o menu

    console.log(session)
    console.log(status)


   




    const navItems = [

        { href: "#Profissionais", label: "Profissionais" },
    ]

    async function handleLogin() { // para que o login seja feito no servidor
        await handleRegister("github")
    }




    const NavLinks = () => (
        <>
            {navItems.map((item) => (
                <Button
                    onClick={() => setIsOpen(false)}
                    key={item.href}
                  
                    className="bg-transparent hover:bg-transparent text-black shadow-none"
                >
                    <Link href={item.href} className="text-base">
                        {item.label}
                    </Link>
                </Button>
            ))}
            {status=== "loading" ? ( // loading é o estado de loading do next-auth
                <></>
            ): session ? (
                <Link
                 href="/dashboard"
                 className=" flex items-center rounded-md justify-center gap-2  px-4 cursor-pointer text-white py-2 bg-zinc-900"
                >
                    Acessar Clinica                    
                </Link>
            ) : (
                <Button onClick={handleLogin} className="flex items-center justify-center gap-2 cursor-pointer runded-md">
                    <LogIn />
                    Portal da clinica
                </Button>
            )}
        </>
    )


    return (
        <header
            className="fixed top-0 right-0 left-0  z-9999 py-4 px-6 bg-white"
        >
            <div className="container mx-auto flex items-center justify-between ">
                <Link
                    href="/"
                    className="text-3xl font-bold text-zinc-900"
                >
                    Odonto<span className="text-blue-500">PRO</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-4">
                    <NavLinks />
                </nav>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>  {/* estado para abrir e fechar o menu */}
                    <SheetTrigger
                        className="md:hidden"
                        render={
                            <Button
                                className="text-black hover:bg-transparent cursor-pointer"
                                variant="ghost"
                                size="icon"
                            />
                        }
                    >
                        <Menu className="w-6 h-6" />
                    </SheetTrigger>

                    <SheetContent side="right" className="w-240px sm:w-300px z-9999">
                        <SheetTitle>Menu</SheetTitle>
                        <SheetHeader></SheetHeader>


                        <SheetDescription>
                            Veja nossos links
                        </SheetDescription>

                        <nav className="flex flex-col space-y-4 mt-6">
                            <NavLinks />
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}