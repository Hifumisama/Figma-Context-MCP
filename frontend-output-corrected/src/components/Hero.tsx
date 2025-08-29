import React from 'react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="w-full px-4 md:px-[97px]">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1246px] mx-auto min-h-[509px] gap-8 md:gap-0">
        {/* Texte descriptif */}
        <div className="flex flex-col justify-center gap-[10px] w-full md:w-[616px] text-center md:text-left">
          <h1 className="text-secondary text-xl md:text-[28px] font-medium leading-[1.5]">
            Hello, I'm John,
          </h1>
          
          <h2 className="text-secondary text-4xl sm:text-6xl md:text-[100px] font-extrabold leading-[1.16]">
            Product Designer
          </h2>
          
          <p className="text-secondary text-xl md:text-[28px] font-medium leading-[1.5]">
            based in Netherland.
          </p>
        </div>

        {/* Image de profil */}
        <div className="relative w-64 h-64 md:w-[506px] md:h-[509px] flex-shrink-0">
          <div className="absolute inset-0 w-full h-full md:w-[493px] md:h-[493px] md:top-0 md:left-[13px] overflow-hidden rounded-lg md:rounded-none">
            <Image
              src="/images/profile-photo.png"
              alt="John Doe Profile"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Bordure SVG - Hidden on mobile */}
          <div className="hidden md:block absolute w-[493px] h-[493px] top-[16px] left-0">
            <svg viewBox="0 0 493 493" fill="none" className="w-full h-full">
              <rect 
                x="0.5" 
                y="0.5" 
                width="492" 
                height="492" 
                stroke="#000000" 
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bouton Resume */}
      <div className="w-full max-w-[1246px] mx-auto mt-4 md:mt-[10px] flex justify-center md:justify-start">
        <button className="relative w-[164px] h-[68px] group">
          {/* Background */}
          <div className="absolute top-[7px] left-[6px] w-[158px] h-[61px] bg-primary-dark rounded-[6px]"></div>
          
          {/* Bordure */}
          <div className="absolute top-0 left-0 w-[158px] h-[61px] border border-secondary-dark rounded-[6px] bg-transparent group-hover:bg-primary-dark transition-colors"></div>
          
          {/* Texte */}
          <span className="absolute top-[16px] left-[38px] text-secondary-dark text-[20px] font-normal leading-[1.5] w-[81px] h-[30px] flex items-center justify-center">
            Resume
          </span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
