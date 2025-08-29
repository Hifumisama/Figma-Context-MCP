import React from 'react';
import Image from 'next/image';

const ProjectCard = ({ 
  imageSrc, 
  date, 
  title, 
  description 
}: { 
  imageSrc: string; 
  date: string; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="w-full max-w-[560px] min-h-[614px] flex flex-col">
      {/* Image */}
      <div className="w-full h-64 md:h-[400px] relative overflow-hidden rounded-lg md:rounded-none">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Date */}
      <div className="mt-2 md:mt-[10px] w-fit h-[44px]">
        <p className="text-secondary text-sm md:text-[15px] font-normal leading-[2.93]">
          {date}
        </p>
      </div>
      
      {/* Title */}
      <div className="w-fit h-[44px]">
        <h3 className="text-secondary text-lg md:text-[24px] font-semibold leading-[1.83]">
          {title}
        </h3>
      </div>
      
      {/* Description */}
      <div className="w-full min-h-[96px]">
        <p className="text-secondary text-base md:text-[18px] font-normal leading-[1.78]">
          {description}
        </p>
      </div>
    </div>
  );
};

const Work = () => {
  const projects = [
    {
      imageSrc: "/images/project1-image.png",
      date: "November 24, 2019",
      title: "Some Case Study",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at."
    },
    {
      imageSrc: "/images/project2-image.png",
      date: "November 24, 2019",
      title: "Some Case Study",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at."
    }
  ];

  return (
    <section className="w-full px-4 md:px-[97px] py-8 md:py-0" id="work">
      <div className="w-full max-w-[1246px] mx-auto">
        {/* Titre de section */}
        <h2 className="text-accent text-4xl sm:text-6xl md:text-[100px] font-extrabold leading-[1.16] w-fit mb-4 md:mb-[10px]">
          work.
        </h2>
        
        {/* Description */}
        <div className="w-full max-w-[900px] mb-4 md:mb-[10px]">
          <p className="text-secondary text-base md:text-[24px] font-normal leading-[1.83]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
          </p>
        </div>

        {/* Container des projets */}
        <div className="w-full flex flex-col md:flex-row justify-between gap-8 md:gap-[10px]">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              imageSrc={project.imageSrc}
              date={project.date}
              title={project.title}
              description={project.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
