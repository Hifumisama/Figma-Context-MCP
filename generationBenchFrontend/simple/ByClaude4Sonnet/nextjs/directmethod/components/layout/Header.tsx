import Image from 'next/image';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="w-full py-4 px-8 flex justify-between items-center bg-light-yellow">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-dark-blue">John Doe</h1>
      </div>
      
      <Navigation className="hidden md:flex" />
      
      <div className="flex items-center gap-4">
        <a 
          href="https://medium.com/johndoe" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <Image
            src="/images/medium-icon.svg"
            alt="Medium"
            width={26}
            height={15}
            className="text-dark-blue"
          />
        </a>
        <a 
          href="https://behance.net/johndoe" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <Image
            src="/images/behance-icon.svg"
            alt="Behance"
            width={26}
            height={17}
            className="text-dark-blue"
          />
        </a>
        <a 
          href="https://twitter.com/johndoe" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <Image
            src="/images/twitter-icon.svg"
            alt="Twitter"
            width={20}
            height={16}
            className="text-dark-blue"
          />
        </a>
      </div>
    </header>
  );
}
