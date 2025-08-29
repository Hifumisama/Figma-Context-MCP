import Image from 'next/image'

export default function Contact() {
  return (
    <section id="contact" className="py-16 lg:py-24">
      <div className="space-y-16">
        {/* Contact Title */}
        <h2 className="text-6xl lg:text-8xl font-extrabold text-accent leading-tight">
          contact.
        </h2>

        {/* Contact Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Contact Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] w-full max-w-lg">
              <Image
                src="/images/contact-photo.png"
                alt="Contact"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-8">
            <p className="text-2xl text-primary leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
              Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
            </p>
            
            {/* Contact Details */}
            <div className="space-y-4">
              <div className="text-xl text-primary">
                <a href="mailto:johndoe@mail.com" className="hover:text-secondary transition-colors">
                  johndoe@mail.com
                </a>
              </div>
              <div className="text-xl text-primary">
                <a href="https://twitter.com/johndoe" className="hover:text-secondary transition-colors">
                  twitter.com/johndoe
                </a>
              </div>
              <div className="text-xl text-primary">
                <a href="https://behance.com/johndoe" className="hover:text-secondary transition-colors">
                  behance.com/johndoe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
