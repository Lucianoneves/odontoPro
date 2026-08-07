import { Suspense } from "react";
import { connection } from "next/server";
import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { Profisionais } from "./_components/profisionais";
import { Footer } from "./_components/footer";
import { getProfessionais } from "./data-access/get-professionais";

// Home sempre busca clínicas atualizadas do banco (não congela no deploy)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  await connection();

  const professionais = await getProfessionais();

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div>
        <Hero />
        <Profisionais professionais={professionais || []} />
        <Footer />
      </div>
    </div>
  );
}
