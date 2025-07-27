function ResumeChecker() {
  return (
    <section className="px-4 sm:px-6 md:px-30 py-10 mt-4 mb-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Video Section */}
        <div className=" flex justify-center z-50 mt-6 md:mt-0 ">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-xl rounded-lg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text Section */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-white leading-snug">
            Rewrite your resume with AI
          </h1>

          <p className="text-gray-600  font-normal text-base sm:text-lg mt-4 leading-normal">
            Get your resume rewritten by the world’s best AI engine (ChatGPT
            4.0) in combination with tailored prompts and a fine-tuned model
            based on your resume and the job ad you’re applying for to save
            time.
            <br />
            Receive content suggestions based on the sections your resume
            currently has. Generate a resume summary or objective based on your
            experience. Get skills suggestions based on the industry you’re
            applying for. Omit buzzwords, filler words, and irrelevant content.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResumeChecker;
