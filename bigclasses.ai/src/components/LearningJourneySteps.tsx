import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import buildingAnimation from "../assets/animations/building.json";
import jobAnimation from "../assets/animations/job.json";
import arrowAnimation from "../assets/animations/arrow.json";

const LearningJourneySteps = () => {
  const [learningAnimationData, setLearningAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadLearningAnimation = async () => {
      try {
        setIsLoading(true);
        const animationData = await import("../assets/animations/learning.json");
        setLearningAnimationData(animationData.default);
        setLoadError(false);
      } catch (error) {
        console.error('Failed to load learning animation:', error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadLearningAnimation();
  }, []);

  const LoadingSpinner = () => (
    <div className="animation-size flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );

  const ErrorFallback = () => (
    <div className="animation-size flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
      <div className="flex flex-col items-center space-y-2">
        <div className="text-red-500 text-2xl">⚠️</div>
        <span className="text-sm text-red-600">Failed to load</span>
      </div>
    </div>
  );

  const AnimationPlayer = ({ src, className, fallback = null }) => {
    const [playerLoaded, setPlayerLoaded] = useState(false);
    const [playerError, setPlayerError] = useState(false);

    return (
      <div className="relative">
        {!playerLoaded && !playerError && (
          <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg absolute inset-0 z-10`}>
            <div className="animate-pulse bg-gray-200 rounded-full h-6 w-6"></div>
          </div>
        )}
        <Player
          autoplay
          loop
          src={src}
          className={`${className} ${!playerLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onEvent={(event) => {
            if (event === 'load' || event === 'ready') {
              setPlayerLoaded(true);
            }
            if (event === 'error') {
              setPlayerError(true);
              setPlayerLoaded(true);
            }
          }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
            clearCanvas: false,
            progressiveLoad: true,
            hideOnTransparent: true
          }}
        />
        {playerError && fallback && (
          <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
            {fallback}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="w-full pb-24 mt-0 md:-mt-20 pt-8 md:pt-0">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 mt-0 inline-block mx-auto px-4">
          
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Hybrid Learning */}
          <div className="flex flex-col items-center space-y-4 mb-8 md:mb-0 -mt-4 md:-mt-12">
            {isLoading && <LoadingSpinner />}
            {loadError && <ErrorFallback />}
            {learningAnimationData && !isLoading && !loadError && (
              <AnimationPlayer
                src={learningAnimationData}
                className="animation-size"
                fallback={<span className="text-gray-500">Animation unavailable</span>}
              />
            )}
            <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Hybrid Learning
            </p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center space-y-2 mb-8 md:mb-0">
            <AnimationPlayer
              src={arrowAnimation}
              className="h-16 w-16 rotation-md"
            />
          </div>

          {/* Hands-On Projects */}
          <div className="flex flex-col items-center space-y-2 mb-8 md:mb-0 mt-4 md:mt-6">
            <AnimationPlayer
              src={buildingAnimation}
              className="animation-size"
              fallback={<span className="text-gray-500">Animation unavailable</span>}
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
            />
          </div>

          {/* Career Support */}
          <div className="flex flex-col items-center space-y-4">
            <AnimationPlayer
              src={jobAnimation}
              className="animation-size"
              fallback={<span className="text-gray-500">Animation unavailable</span>}
            />
            <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Career Support
            </p>
          </div>
        </div>

        <style type='text/css'>
          {`
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
          `}
        </style>
      </div>
    </section>
  );
};

export default LearningJourneySteps;