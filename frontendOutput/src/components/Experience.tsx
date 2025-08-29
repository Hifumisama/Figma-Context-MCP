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
]

export default function Experience() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {experiences.map((exp, index) => (
          <div key={index} className="flex items-start space-x-8">
            {/* Dot indicator */}
            <div className="flex-shrink-0 mt-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-primary">
                {exp.period}
              </h3>
              <p className="text-xl text-primary leading-relaxed">
                {exp.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
