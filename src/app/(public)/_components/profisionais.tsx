import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import foto1 from "../../../../public/foto1.png";
import type { User } from "@/generated/prisma/client";
import { getValidImageSrc } from "@/utils/get-valid-image-src";

interface ProfisionaisProps {
    professionais: User[];
}



export function Profisionais({ professionais }: ProfisionaisProps) {
    return (
        <section className="bg-gray-100 py-16">
            <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl mb-12 font-bold">
                    Clinicas Disponiveis
                </h2>




                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {professionais.map((clinic) => (
                        <Card className="overflow-hidden hover:shadow-lg duration-500" key={clinic.id}>
                            <CardContent className="p-0">
                                <div>
                                    <div className="relative h-48">
                                        <Image
                                            src={getValidImageSrc(clinic.image) || foto1}
                                            alt={clinic.name ?? "Foto da clínica"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            priority
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            {clinic.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {clinic.address ?? "Endereço não informado"}
                                        </p>
                                    </div>

                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                                </div>

                                <Link
                                    href={`/clinica/${clinic.id}`}
                                    className="w-full bg-blue-400 text-white py-2 rounded-md flex items-center justify-center md:text-base font-medium text-sm"
                                >
                                    Agendar horario
                                    <ArrowRight className="ml-2" />
                                </Link>
                            </CardContent>
                        </Card>

                    ))}

                </section>
            </div>
        </section>
    )
}
