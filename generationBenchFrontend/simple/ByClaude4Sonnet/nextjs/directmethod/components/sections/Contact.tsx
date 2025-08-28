import Image from 'next/image';

export default function Contact() {
  const contactInfo = [
    {
      type: "email",
      label: "johndoe@mail.com",
      href: "mailto:johndoe@mail.com"
    },
    {
      type: "twitter",
      label: "twitter.com/johndoe", 
      href: "https://twitter.com/johndoe"
    },
    {
      type: "behance",
      label: "behance.com/johndoe",
      href: "https://behance.net/johndoe"
    }
  ];

  return (
    <section id="contact" className="py-16 px-8 bg-light-yellow">
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-too-light-yellow mb-12">
          contact.
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact info */}
          <div className="space-y-8">
            <p className="text-xl md:text-2xl text-dark-blue leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
              Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
            </p>
            
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index}>
                  <a 
                    href={contact.href}
                    target={contact.type !== 'email' ? '_blank' : undefined}
                    rel={contact.type !== 'email' ? 'noopener noreferrer' : undefined}
                    className="text-xl text-dark-blue hover:text-dark-brown transition-colors leading-relaxed"
                  >
                    {contact.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md h-80 rounded-2xl overflow-hidden">
              <Image
                src="/images/contact-image.png"
                alt="Contact"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
