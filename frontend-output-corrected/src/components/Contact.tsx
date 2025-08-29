import React from 'react';
import Image from 'next/image';

const Contact = () => {
  return (
    <section className="w-full px-4 md:px-[97px] py-8 md:py-0" id="contact">
      <div className="w-full max-w-[1246px] mx-auto">
        {/* Titre de section */}
        <h2 className="text-accent text-4xl sm:text-6xl md:text-[100px] font-extrabold leading-[1.16] w-fit mb-4 md:mb-[10px]">
          contact.
        </h2>

        {/* Container Contact */}
        <div className="w-full max-w-[1121px] min-h-[338px] flex flex-col md:flex-row justify-between gap-8 md:gap-[10px]">
          {/* Image */}
          <div className="w-full md:w-[456px] h-64 md:h-[284px] relative overflow-hidden rounded-lg md:rounded-none flex-shrink-0">
            <Image
              src="/images/contact-photo.png"
              alt="Contact"
              fill
              className="object-cover"
            />
          </div>

          {/* Texte de contact */}
          <div className="w-full md:w-[640px] min-h-[338px] flex flex-col gap-4 md:gap-[10px]">
            {/* Description */}
            <div className="w-full">
              <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
              </p>
            </div>

            {/* Informations de contact */}
            <div className="flex flex-col gap-2 md:gap-[10px] mt-2 md:mt-[10px]">
              <div className="w-full h-[44px] flex items-center">
                <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
                  johndoe@mail.com
                </p>
              </div>
              
              <div className="w-full h-[44px] flex items-center">
                <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
                  twitter.com/johndoe
                </p>
              </div>
              
              <div className="w-full h-[44px] flex items-center">
                <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
                  behance.com/johndoe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
