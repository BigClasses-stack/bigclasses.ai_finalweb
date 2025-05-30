import { Player } from '@lottiefiles/react-lottie-player';
import learningAnimation from "../assets/animations/learning.json";
import buildingAnimation from "../assets/animations/building.json";
import jobAnimation from "../assets/animations/job.json";
import arrowAnimation from "../assets/animations/arrow.json"; 

const LearningJourneySteps = () => {
  return (
    <section className="w-full py-10 "> 
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center"> 
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 inline-block mx-auto px-4">
          India’s Leading Tech Training Hub
        </h2>

        {/* Animations */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
  <div className="flex flex-col items-center space-y-4">
    <Player autoplay loop src={learningAnimation} className="animation-size" />
    <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">Hybrid Learning</p>
  </div>

  {/* Arrow Animation */}
  <div className="flex flex-col items-center space-y-2"> {/* Reduced space-y */}
    <Player autoplay loop src={arrowAnimation} className="h-16 w-16 rotation-md " />
  </div>

  <div className="flex flex-col items-center space-y-4">
    <Player autoplay loop src={buildingAnimation} className="animation-size" />
    <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">Hands-On Projects</p>
  </div>

  {/* Arrow Animation */}
  <div className="flex flex-col items-center space-y-2"> {/* Reduced space-y */}
    <Player autoplay loop src={arrowAnimation} className="h-16 w-16  rotation-md " />
  </div>

  <div className="flex flex-col items-center space-y-4">
    <Player autoplay loop src={jobAnimation} className="animation-size" />
    <p className="text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">Career Support</p>
  </div>
</div>

<style type='text/css' >
  {`
  @media  (max-width: 768px) {
      .rotation-md  {
       transform: rotate(90deg);
      }
    }
    @media (min-width: 768px) and (max-width: 900px) {
      .animation-size {
        height: 150px;  
        width: 150px;   
      }
    }
       @media (min-width: 901px) and (max-width: 1100px)   {
      .animation-size {
        height: 200px;  
        width: 200px;      
      }
    }
         @media (min-width: 1101px)    {
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
