import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Work from '../components/sections/Work';
import Contact from '../components/sections/Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-light-yellow">
      <Header />
      <main>
        <Hero />
        <About />
        <Work />
        <Contact />
      </main>
    </div>
  );
}
