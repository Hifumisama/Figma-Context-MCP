import Image from 'next/image'

export default function Header() {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center">
        {/* Logo/Name */}
        <div className="text-2xl font-semibold text-primary">
          John Doe
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-primary hover:text-secondary transition-colors">
            Home
          </a>
          <a href="#about" className="text-primary hover:text-secondary transition-colors">
            About
          </a>
          <a href="#work" className="text-primary hover:text-secondary transition-colors">
            Work
          </a>
        </nav>

        {/* Social Icons */}
        <div className="flex items-center space-x-4">
          <a href="#" className="text-primary hover:text-secondary transition-colors">
            <svg width="26" height="16" viewBox="0 0 26 16" fill="currentColor">
              <path d="M13 0C8.6 0 5 3.6 5 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
            </svg>
          </a>
          <a href="#" className="text-primary hover:text-secondary transition-colors">
            <svg width="26" height="18" viewBox="0 0 26 18" fill="currentColor">
              <path d="M23.3 4.4c0-.2 0-.4-.1-.6v-.1c-.6-2.3-2.4-4.1-4.7-4.7h-.1c-.2 0-.4-.1-.6-.1-1.5-.1-3-.1-4.5-.1s-3 0-4.5.1c-.2 0-.4 0-.6.1h-.1c-2.3.6-4.1 2.4-4.7 4.7v.1c0 .2-.1.4-.1.6-.1 1.5-.1 3-.1 4.5s0 3 .1 4.5c0 .2 0 .4.1.6v.1c.6 2.3 2.4 4.1 4.7 4.7h.1c.2 0 .4.1.6.1 1.5.1 3 .1 4.5.1s3 0 4.5-.1c.2 0 .4 0 .6-.1h.1c2.3-.6 4.1-2.4 4.7-4.7v-.1c0-.2.1-.4.1-.6.1-1.5.1-3 .1-4.5s0-3-.1-4.5z"/>
            </svg>
          </a>
          <a href="#" className="text-primary hover:text-secondary transition-colors">
            <svg width="26" height="15" viewBox="0 0 26 15" fill="currentColor">
              <path d="M13 0C6.4 0 1 6.7 1 15h24c0-8.3-5.4-15-12-15z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
