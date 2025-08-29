import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col gap-8 md:gap-[10px]">
        <Hero />
        <About />
        <Work />
        <Contact />
      </main>
    </div>
  );
}
