import Image from 'next/image'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Work from '@/components/Work'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-light">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Hero />
        <About />
        <Experience />
        <Work />
        <Contact />
      </main>
    </div>
  )
}
