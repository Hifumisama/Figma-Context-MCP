import Image from 'next/image'

export default function Hero() {
  return (
    <section id="home" className="py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-2xl text-primary font-medium">
              Hello, I'm John,
            </p>
            <h1 className="text-6xl lg:text-8xl font-extrabold text-primary leading-tight">
              Product Designer
            </h1>
            <p className="text-2xl text-primary font-medium">
              based in Netherland.
            </p>
          </div>

          {/* Resume Button */}
          <div className="flex items-center space-x-6">
            <button className="bg-yellow-medium border-2 border-secondary text-secondary px-8 py-4 rounded-lg font-medium text-lg hover:bg-yellow-dark transition-colors">
              Resume
            </button>
            
            {/* Decorative squares */}
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-7 bg-secondary rounded"></div>
              ))}
            </div>
          </div>

          {/* Decorative plus shapes */}
          <div className="flex space-x-6">
            <div className="relative">
              <div className="w-6 h-6">
                <div className="absolute inset-x-2 inset-y-0 w-2 bg-secondary rounded"></div>
                <div className="absolute inset-y-2 inset-x-0 h-2 bg-secondary rounded"></div>
              </div>
            </div>
            <div className="relative ml-6">
              <div className="w-6 h-6">
                <div className="absolute inset-x-2 inset-y-0 w-2 bg-secondary rounded"></div>
                <div className="absolute inset-y-2 inset-x-0 h-2 bg-secondary rounded"></div>
              </div>
            </div>
            <div className="relative ml-6">
              <div className="w-6 h-6">
                <div className="absolute inset-x-2 inset-y-0 w-2 bg-secondary rounded"></div>
                <div className="absolute inset-y-2 inset-x-0 h-2 bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Profile Image */}
        <div className="relative">
          <div className="relative w-full max-w-lg mx-auto">
            <div className="aspect-square relative">
              <Image
                src="/images/profile-photo.png"
                alt="John Doe Profile"
                fill
                className="object-cover rounded-lg"
                priority
              />
              <div className="absolute inset-0 border-2 border-secondary rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
