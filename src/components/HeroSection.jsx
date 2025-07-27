function HeroSection() {

  return (
    <section className="px-6 sm:px-8 md:px-30 pt-10 pb-10">
  <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 items-start gap-8">
    {/* Text Section */}
    <div className="md:col-span-3">
      <span className="text-indigo-600 text-xs uppercase block mt-4 sm:mt-6">
        Resume Checker
      </span>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-800 dark:text-white leading-snug mt-4 sm:mt-6">
        Is your resume good enough?
      </h1>

      <p className="text-gray-600 text-base sm:text-lg mt-4">
        A free and fast AI resume checker doing 16 crucial checks to ensure <br />
        your resume is ready to perform and get you interview callbacks.
      </p>
    </div>

    {/* Image Section */}
    <div className="md:col-span-2 flex justify-center self-start mt-10 md:mt-0">
      <img
        src="/resume2.svg"
        alt="AI Resume Checker"
        className="max-w-full h-auto w-4/5 sm:w-3/4 md:w-full mix-blend-multiply"
      />
    </div>
  </div>
</section>

  );
}

export default HeroSection;
