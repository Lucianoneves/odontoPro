import { Button } from "@/components/ui/button";
import Image from "next/image";
import doctorImage from "../../../../public/doctor-hero.png";


export function Hero() {
    return (
        <section className="bg-white-100 ">
            <div className="container mx-auto px-4 pt-20 sm:px-6 lg:px-8 pb-4 sm:pb-0 lg:pb-8">

            <main  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <article className="  flex-2 space-y-8 max-w-3xl flex flex-col  justify-center">
                    <h1 className="text-4xl font-bold lg-4xl max-w-2xl tracking-tight">
                        Encontre os melhores  profissionais  em um unico local!
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-600">
                        Nós somos uma plataforma  para profissionais de saúde  odontologia 
                         com o foco em agilizar seu atendimento de forma simplificada e organizada.
                    </p>

                    <Button className="bg-blue-400 text-white hover:bg-blue-500 w-fit px-6 font-semibold">
                        encontre seu profissional
                    </Button>
                </article>

                <div className="hidden lg:block">
                    <Image
                    src={doctorImage}
                     alt="doctor-hero"
                     width={340}
                     height={400}
                     className="object-contain"
                     quality={100}
                     priority={true}
                      />                    
                </div>                
                 </main>
                 </div>
        </section>
    )
}