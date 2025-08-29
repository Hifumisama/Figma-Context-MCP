import React from 'react';

const AboutItem = ({ year, description }: { year: string; description: string }) => {
  return (
    <div className="w-full max-w-[900px] min-h-[182px] flex flex-col md:flex-row gap-4 md:gap-0">
      <div className="w-fit h-[40px] flex-shrink-0">
        <p className="text-secondary text-lg md:text-[24px] font-semibold leading-[1.67]">
          {year}
        </p>
      </div>
      <div className="md:ml-[17px] md:mt-[50px] w-full md:w-[883px] min-h-[132px]">
        <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
          {description}
        </p>
      </div>
    </div>
  );
};

const About = () => {
  const aboutItems = [
    {
      year: "2014-2018",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    },
    {
      year: "2018-2020",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    },
    {
      year: "2020 - Present",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    }
  ];

  return (
    <section className="w-full px-4 md:px-[97px] py-8 md:py-0" id="about">
      <div className="w-full max-w-[1246px] mx-auto">
        {/* Titre de section */}
        <h2 className="text-accent text-4xl sm:text-6xl md:text-[100px] font-extrabold leading-[1.16] w-fit mb-4 md:mb-[10px]">
          about.
        </h2>
        
        {/* Description */}
        <div className="w-full max-w-[900px] mb-4 md:mb-[10px]">
          <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
          </p>
        </div>

        {/* Container About */}
        <div className="w-full flex flex-col items-center md:items-end">
          <div className="w-full max-w-[900px] flex flex-col gap-4 md:gap-[10px]">
            {aboutItems.map((item, index) => (
              <AboutItem
                key={index}
                year={item.year}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
