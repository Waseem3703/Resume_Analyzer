import ResumeCardItem from "./ResumeFeatureCard";

const leftColumn = [
  {
    title: "",
    features: [
      "ATS parse rate",
      "Repetition of words and phrases",
      "Spelling and grammar",
      "Quantifying impact in experience section with examples"
    ]
  }
];

const rightColumn = [
  {
    title: "Format",
    features: [
      "File format and size",
      "Resume length",
      "Long bullet points with suggestions on how to shorten"
    ]
  },
  {
    title: "Skills suggestion",
    features: ["Hard skills", "Soft skills"]
  }
];

const bottomColumn = [
  {
    title: "Resume sections",
    features: [
      "Contact information",
      "Essential sections",
      "Personality showcase with tips on how to improve"
    ]
  },
  {
    title: "Style",
    features: [
      "Email address",
      "Usage of active voice",
      "Usage of buzzwords and cliches"
    ]
  }
];

function ResumeCard() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-r from-black via-gray-900 to-blue-600">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Full-width heading */}
        <div className="col-span-1 md:col-span-3 text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-snug">
            Our AI-powered resume checker goes beyond typos and punctuation
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            We’ve built-in ChatGPT to help you create a resume that’s tailored
            to the position you’re applying for.
          </p>
        </div>

        {/* Left Column */}
        <div>
          <div className="text-white mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Resume optimization checklist
            </h3>
            <p className="text-base sm:text-lg text-gray-200">
              We check for 16 crucial things across 5 different categories on
              your resume including content, file type, and keywords in the most
              important sections of your resume. Here’s a full list of the
              checks you’ll receive:
            </p>
          </div>
          {leftColumn.map((card, i) => (
            <ResumeCardItem key={i} {...card} />
          ))}
        </div>

        {/* Right Column */}
        <div>
          {rightColumn.map((card, i) => (
            <ResumeCardItem key={i} {...card} />
          ))}
        </div>

        {/* Bottom Column */}
        <div>
          {bottomColumn.map((card, i) => (
            <ResumeCardItem key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResumeCard;
