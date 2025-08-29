import Image from 'next/image'

const projects = [
  {
    title: "Some Case Study",
    date: "November 24, 2019",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
    image: "/images/project1-image.png"
  },
  {
    title: "Some Case Study",
    date: "November 24, 2019", 
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
    image: "/images/project2-image.png"
  }
]

export default function Work() {
  return (
    <section id="work" className="py-16 lg:py-24">
      <div className="space-y-16">
        {/* Work Title */}
        <h2 className="text-6xl lg:text-8xl font-extrabold text-accent leading-tight">
          work.
        </h2>

        {/* Work Description */}
        <div className="max-w-4xl">
          <p className="text-2xl text-primary leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
            Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-16">
          {projects.map((project, index) => (
            <div key={index} className="space-y-6">
              {/* Project Image */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              
              {/* Project Details */}
              <div className="space-y-4">
                <p className="text-sm text-primary opacity-80">
                  {project.date}
                </p>
                <h3 className="text-2xl font-semibold text-primary">
                  {project.title}
                </h3>
                <p className="text-lg text-primary leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
