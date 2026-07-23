import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import foto1 from "../../../../public/foto1.png";

export function Profisionais() {
    return (
        <section className="bg-gray-100 py-16">
            <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl mb-12 font-bold">
                    Clinicas Disponiveis
                </h2>


                

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div>
                                <div className="relative h-48">
                                    <Image
                                        src={foto1}
                                        alt="foto1"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Clinica centro
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        Rua Izabel Redentora, centro, São jose dos pinhais, PR
                                    </p>
                                </div>

                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                            </div>

                            <Link
                                href="/clicnica/123"
                                className="w-full bg-blue-400 text-white py-2 rounded-md flex items-center justify-center md:text-base font-medium text-sm"
                            >
                                Agendar horario
                                <ArrowRight className="ml-2" />
                            </Link>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </section>
    )
}
