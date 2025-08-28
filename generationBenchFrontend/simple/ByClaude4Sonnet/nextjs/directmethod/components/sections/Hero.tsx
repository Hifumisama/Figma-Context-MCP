import Image from 'next/image';
import { Button } from '../ui/Button';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center px-8 py-16 bg-light-yellow">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-medium text-dark-blue">
              Hello, I'm John,
            </h2>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-dark-blue leading-tight">
              Product Designer
            </h1>
            <h3 className="text-3xl md:text-4xl font-medium text-dark-blue">
              based in Netherland.
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Decorative elements */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-8 bg-dark-brown rounded-sm"
                />
              ))}
            </div>
          </div>
          
          <Button variant="primary" size="lg">
            Resume
          </Button>
        </div>
        
        {/* Right content - Profile image */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="relative w-80 h-96 md:w-96 md:h-[500px] overflow-hidden rounded-2xl border-4 border-dark-brown">
              <Image
                src="/images/profile-image.png"
                alt="John Doe - Product Designer"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Decorative plus signs */}
            <div className="absolute -top-6 -right-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 relative bg-transparent rounded-md border-2 border-dark-brown">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-dark-brown rounded-sm"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-dark-brown rounded-sm"></div>
                </div>
                <div className="w-6 h-6 relative bg-transparent rounded-md border-2 border-dark-brown">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-dark-brown rounded-sm"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-dark-brown rounded-sm"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 relative bg-transparent rounded-md border-2 border-dark-brown">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-dark-brown rounded-sm"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-dark-brown rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
