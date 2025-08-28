'use client';

import { useState } from 'react';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [activeItem, setActiveItem] = useState('Home');

  const navigationItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Work', href: '#work' },
  ];

  const handleItemClick = (name: string) => {
    setActiveItem(name);
    // Smooth scroll to section
    const element = document.querySelector(name === 'Home' ? '#hero' : `#${name.toLowerCase()}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`flex gap-8 ${className}`}>
      {navigationItems.map((item) => (
        <button
          key={item.name}
          onClick={() => handleItemClick(item.name)}
          className={`text-lg font-normal text-dark-blue hover:text-dark-brown transition-colors ${
            activeItem === item.name ? 'font-medium' : ''
          }`}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );
}
