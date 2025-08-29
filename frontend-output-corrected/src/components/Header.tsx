import React from 'react';

const Header = () => {
  return (
    <header className="w-full px-4 md:px-[97px] py-4 md:py-[34px]">
      <div className="flex justify-between items-center w-full max-w-[1246px] mx-auto">
        {/* Logo */}
        <div className="text-secondary text-lg md:text-[24px] font-semibold leading-[1.5]">
          John Doe
        </div>

        {/* Navigation Menu - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-[61px]">
          <a href="#home" className="text-secondary text-base lg:text-[18px] font-normal leading-[1.5] hover:text-secondary-dark transition-colors">
            Home
          </a>
          <a href="#about" className="text-secondary text-base lg:text-[18px] font-normal leading-[1.5] hover:text-secondary-dark transition-colors">
            About
          </a>
          <a href="#work" className="text-secondary text-base lg:text-[18px] font-normal leading-[1.5] hover:text-secondary-dark transition-colors">
            Work
          </a>
        </nav>

        {/* Social Media Icons */}
        <div className="flex items-center gap-2 md:gap-[10px]">
          {/* Medium Icon */}
          <a href="#" className="w-5 h-3 md:w-[26px] md:h-[15px] text-secondary hover:text-secondary-dark transition-colors">
            <svg viewBox="0 0 26 15" fill="currentColor" className="w-full h-full">
              <path d="M7.33 0C3.275 0 0 3.36 0 7.5S3.275 15 7.33 15C11.385 15 14.66 11.64 14.66 7.5S11.385 0 7.33 0zM18.995 0C16.97 0 15.33 3.36 15.33 7.5S16.97 15 18.995 15C21.02 15 22.66 11.64 22.66 7.5S21.02 0 18.995 0zM24.67 0C23.92 0 23.33 3.36 23.33 7.5S23.92 15 24.67 15C25.42 15 26 11.64 26 7.5S25.42 0 24.67 0z"/>
            </svg>
          </a>
          
          {/* Behance Icon */}
          <a href="#" className="w-5 h-4 md:w-[26px] md:h-[16px] text-secondary hover:text-secondary-dark transition-colors">
            <svg viewBox="0 0 26 16" fill="currentColor" className="w-full h-full">
              <path d="M6.5 0C2.91 0 0 2.91 0 6.5S2.91 13 6.5 13S13 10.09 13 6.5S10.09 0 6.5 0zM19.5 3C15.91 3 13 5.91 13 9.5S15.91 16 19.5 16S26 13.09 26 9.5S23.09 3 19.5 3z"/>
            </svg>
          </a>
          
          {/* Twitter Icon */}
          <a href="#" className="w-5 h-4 md:w-[26px] md:h-[18px] text-secondary hover:text-secondary-dark transition-colors">
            <svg viewBox="0 0 26 18" fill="currentColor" className="w-full h-full">
              <path d="M26 2.13c-.95.42-1.98.71-3.05.84 1.1-.65 1.94-1.69 2.34-2.92-1.03.61-2.17 1.05-3.38 1.29C20.94.39 19.54-.25 18-.25c-2.92 0-5.29 2.37-5.29 5.29 0 .41.05.82.13 1.21-4.4-.22-8.3-2.33-10.91-5.53-.46.78-.72 1.69-.72 2.66 0 1.84.93 3.46 2.35 4.41-.87-.03-1.69-.27-2.4-.66v.07c0 2.56 1.82 4.7 4.24 5.19-.44.12-.91.18-1.39.18-.34 0-.67-.03-1-.09.68 2.11 2.65 3.65 4.98 3.69-1.83 1.43-4.13 2.28-6.63 2.28-.43 0-.86-.03-1.28-.08 2.38 1.53 5.2 2.42 8.24 2.42 9.88 0 15.28-8.19 15.28-15.28 0-.23 0-.46-.02-.69 1.05-.76 1.96-1.7 2.68-2.78z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
