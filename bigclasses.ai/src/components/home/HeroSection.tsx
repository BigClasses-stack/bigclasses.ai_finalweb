

import React, { useEffect, useState } from "react";
import LearningJourneySteps from "../LearningJourneySteps";
import ScrollingTicker from "./ScrollingTicker";

const HeroSection = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Learn", "Build", "Get Hired"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ScrollingTicker />
      <section
        id="hero" 
        className="min-h-[100vh] h-[auto] w-full flex items-center justify-center px-6 md:px-20"
      >
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Let's{" "}
            <span className="text-blue-600 inline-block min-w-[200px]">
              {words[wordIndex]}
            </span>
            {" "}with AI-Powered Classes
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            From beginner to hired professional - our complete learning path includes expert instruction, practical projects, and career placement support.
          </p>
          <LearningJourneySteps />
        </div>
      </section>
    </>
  );
};

export default HeroSection;