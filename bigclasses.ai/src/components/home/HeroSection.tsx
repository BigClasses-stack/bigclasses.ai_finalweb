import React from "react";
import LearningJourneySteps from "../LearningJourneySteps";
const HeroSection = () => {
  return (
    <section
      id="hero" 
      className="min-h-[100vh] h-[auto] w-full flex items-center justify-center px-6 md:px-20"
    >
      <div className="text-center max-w-xl">
        <LearningJourneySteps />
      </div>
    </section>
  );
};

export default HeroSection;