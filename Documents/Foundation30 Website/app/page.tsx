import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { ThreePillars } from "@/components/sections/ThreePillars";
import { CalculatorCTA } from "@/components/sections/CalculatorCTA";
import { Footer } from "@/components/layout/Footer";


export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ThreePillars />
        <CalculatorCTA />
      </main>
      <Footer />
    </div>
  );
}


