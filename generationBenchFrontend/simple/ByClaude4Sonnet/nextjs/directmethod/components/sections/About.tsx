export default function About() {
  const experiences = [
    {
      period: "2014-2018",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    },
    {
      period: "2018-2020", 
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    },
    {
      period: "2020 - Present",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
    }
  ];

  return (
    <section id="about" className="py-16 px-8 bg-light-yellow">
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-too-light-yellow mb-12">
          about.
        </h2>
        
        {/* About description */}
        <div className="mb-16">
          <p className="text-xl md:text-2xl text-dark-blue leading-relaxed max-w-4xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
            Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
          </p>
        </div>
        
        {/* Timeline */}
        <div className="space-y-12">
          {experiences.map((experience, index) => (
            <div key={index} className="flex gap-8 items-start">
              {/* Timeline bullet */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-dark-blue rounded-full mt-2"></div>
                {index < experiences.length - 1 && (
                  <div className="w-0.5 h-20 bg-dark-blue opacity-30 mt-4"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-semibold text-dark-blue">
                  {experience.period}
                </h3>
                <p className="text-xl text-dark-blue leading-relaxed max-w-4xl">
                  {experience.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
