import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import buildingAnimation from "../assets/animations/building.json";
import jobAnimation from "../assets/animations/job.json";
import arrowAnimation from "../assets/animations/arrow.json";
import learningAnimation from "../assets/animations/learning.json"; // Direct import

const rotatingWords = ["Learn", "Build", "Get Hired"];

const LearningJourneySteps = () => {
  const [displayWord, setDisplayWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect - EVEN SLOWER
  useEffect(() => {
    const currentWord = rotatingWords[wordIndex];
    let typeSpeed = 300; // Increased from 200 to 300ms (even slower typing)

    if (isDeleting) {
      typeSpeed = 150; // Increased from 100 to 150ms (slower deleting)
    }

    // Add longer pause at the end of each word before deleting
    if (charIndex === currentWord.length && !isDeleting) {
      typeSpeed = 3000; // Increased from 2500 to 3000ms (3 second pause)
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => {
        const next = isDeleting ? prev - 1 : prev + 1;

        if (!isDeleting && next === currentWord.length) {
          setIsDeleting(true);
          return next;
        }

        if (isDeleting && next === 0) {
          setIsDeleting(false);
          setWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
          return 0;
        }

        return next;
      });

      setDisplayWord(currentWord.substring(0, charIndex));
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  interface AnimationPlayerProps {
    src: any;
    className?: string;
    speed?: number; // Add speed control
  }

  const AnimationPlayer = ({ src, className = '', speed = 0.4 }: AnimationPlayerProps) => (
    <Player
      autoplay
      loop
      src={src}
      speed={speed} // Control Lottie animation speed (0.4 = 40% of normal speed)
      className={className}
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
      }}
    />
  );

  return (
    <section className="w-full pb-24 pt-28 md:pt-32">
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center px-4">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2 -mt-24 whitespace-nowrap">
          Let's <span className="text-blue-600">{displayWord}</span> with AI-Powered Classes
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mt-2 mb-10">
          From beginner to hired professional – our complete learning path includes expert instruction, practical projects, and career placement support.
        </p>

        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Hybrid Learning */}
          <div className="flex flex-col items-center space-y-4 mb-8 md:mb-0">
            <AnimationPlayer 
              src={learningAnimation} 
              className="animation-size"
              speed={0.3} // Very slow learning animation
            />
            <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Hybrid Learning
            </p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center space-y-2 mb-8 md:mb-0">
            <AnimationPlayer 
              src={arrowAnimation} 
              className="h-16 w-16 rotation-md"
              speed={0.25} // Extra slow arrow animation
            />
          </div>

          {/* Hands-On Projects */}
          <div className="flex flex-col items-center space-y-4 mb-8 md:mb-0">
            <AnimationPlayer 
              src={buildingAnimation} 
              className="animation-size"
              speed={0.35} // Slow building animation
            />
            <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Hands-On Projects
            </p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center space-y-2 mb-8 md:mb-0">
            <AnimationPlayer 
              src={arrowAnimation} 
              className="h-16 w-16 rotation-md"
              speed={0.25} // Extra slow arrow animation
            />
          </div>

          {/* Career Support */}
          <div className="flex flex-col items-center space-y-4">
            <AnimationPlayer 
              src={jobAnimation} 
              className="animation-size"
              speed={0.3} // Very slow job animation
            />
            <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Career Support
            </p>
          </div>
        </div>

        {/* Responsive Animation Sizes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 768px) {
                .rotation-md {
                  transform: rotate(90deg);
                }
              }
              @media (min-width: 768px) and (max-width: 900px) {
                .animation-size {
                  height: 150px;
                  width: 150px;
                }
              }
              @media (min-width: 901px) and (max-width: 1100px) {
                .animation-size {
                  height: 200px;
                  width: 200px;
                }
              }
              @media (min-width: 1101px) {
                .animation-size {
                  height: 300px;
                  width: 300px;
                }
              }
            `,
          }}
        />
      </div>
    </section>
  );
};

export default LearningJourneySteps;