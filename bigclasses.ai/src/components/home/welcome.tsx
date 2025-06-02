import React from "react";

const Welcome = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6">
          Welcome To <span className="text-blue-600">BigClasses</span>
        </h2>
        <p className="text-center text-gray-700 max-w-4xl mx-auto mb-12 text-lg">
          We are proud to be one of the leading IT online training providers in the industry.
          We are into online training with much passion and dedication from many years.
          The expertise we acquired through this helped us to improve our skills in delivering
          our services. Our trainers with real-time experience and skills in online training
          are dedicated towards producing quality learning.
        </p>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left - Image Grid */}
          <div className="grid grid-cols-2 gap-4 lg:w-1/2">
            <img
              src="https://i.pinimg.com/474x/07/ea/37/07ea372824f53401cd92df9554605ca9.jpg"
              alt="Student Learning"
              className="rounded-xl object-cover w-full h-56"
            />
            <img
              src="https://i.pinimg.com/474x/be/f9/bf/bef9bfd87646ccaef465a7132337fb8b.jpg"
              alt="Online Class"
              className="rounded-xl object-cover w-full h-56"
            />
            <img
              src="https://i.pinimg.com/736x/66/1e/2a/661e2acf4c682d510033922fa1e873df.jpg"
              alt="Learning Platform"
              className="rounded-xl object-cover w-full h-80 col-span-2"
            />
          </div>

          {/* Right - Highlights in Single Column */}
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">
              Our Training <span className="text-blue-600">Highlights</span>
            </h3>
            <ul className="space-y-4 text-gray-800 text-lg">
              {[
                "Very interactive and career oriented sessions",
                "Recorded Sessions for your reference even after the course completion",
                "Unlimited access to Digital Library to master your course",
                "Flexible batch timings for working professionals",
                "Goal oriented, comprehensive training based on your specific learning needs",
                "24X7 technical support team via Phone, Email and Chat",
                "Certified industry experts as trainers"
              ].map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">»</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
