import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { DigitalTwin } from "@/components/DigitalTwin";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Nav } from "@/components/Nav";
import { Portfolio } from "@/components/Portfolio";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Journey />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <DigitalTwin />
    </>
  );
}
