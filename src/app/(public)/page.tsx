import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { Profisionais } from "./_components/profisionais";
import { Footer } from "./_components/footer";
import { getProfessionais } from "./data-access/get-professionais";

export default  async function Home() {

  const professionais = await getProfessionais();

  console.log(professionais);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div> <Hero />
      
      <Profisionais professionais={professionais || []}  />
      <Footer />
      </div>
      
    </div>
  );
}