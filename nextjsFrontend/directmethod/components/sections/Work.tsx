import Image from 'next/image';

export default function Work() {
  const projects = [
    {
      title: "Some Case Study",
      date: "November 24, 2019",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
      image: "/images/project1.png"
    },
    {
      title: "Some Case Study",
      date: "November 24, 2019", 
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
      image: "/images/project2.png"
    }
  ];

  return (
    <section id="work" className="py-16 px-8 bg-light-yellow">
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-too-light-yellow mb-12">
          work.
        </h2>
        
        {/* Work description */}
        <div className="mb-16">
          <p className="text-xl md:text-2xl text-dark-blue leading-relaxed max-w-4xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
            Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
          </p>
        </div>
        
        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <div key={index} className="space-y-6">
              {/* Project image */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-yellow">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Project info */}
              <div className="space-y-3">
                <p className="text-sm text-dark-blue font-normal leading-loose">
                  {project.date}
                </p>
                <h3 className="text-2xl font-semibold text-dark-blue leading-relaxed">
                  {project.title}
                </h3>
                <p className="text-lg text-dark-blue leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
