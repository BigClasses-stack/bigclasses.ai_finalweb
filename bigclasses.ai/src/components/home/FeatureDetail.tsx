import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { features } from "./FeaturesSection.tsx";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../layout/Navbar"; // If Navbar is in a layout folder
import "./FeatureDetail.css";

// Add some additional CSS for new layout
const additionalStyles = `
  .feature-details-container {
    margin: 2rem 0;
  }
  
  .feature-details-layout {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
  }
  
  .feature-small-image {
    flex: 0 0 200px;
  }
  
  .feature-small-image img {
    width: 100%;
    object-fit: cover;
  }
  
  .feature-extended-description {
    flex: 1;
  }
  
  .benefits-section {
    margin-top: 1.5rem;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 4px solid #3b82f6;
  }
  
  .benefits-title {
    font-weight: 600;
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    color: #1f2937;
  }
  
  .benefits-list {
    list-style-type: disc;
    padding-left: 1.5rem;
  }
  
  .benefits-list li {
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .feature-details-layout {
      flex-direction: column;
    }
    
    .feature-small-image {
      width: 100%;
      margin-bottom: 1.5rem;
    }
  }
`;

// Simple function to get related features
const getRelatedFeatures = (currentId) => {
  // Return all features except the current one
  return features.filter(feature => feature.id !== currentId);
};

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(null);
  const [currentFeatureData, setCurrentFeatureData] = useState(null);
  const [relatedFeatures, setRelatedFeatures] = useState([]);

  useEffect(() => {
    // Update currentFeature when URL param changes
    if (id) {
      setCurrentFeature(id);
      
      // Find the current feature data
      const featureData = features.find(feature => feature.id === id) || features[0];
      setCurrentFeatureData(featureData);
      
      // Get related features
      const related = getRelatedFeatures(id);
      setRelatedFeatures(related);
      
      // Scroll to the top of the page when navigating to a new feature
      window.scrollTo(0, 0);
    } else if (features.length > 0) {
      // If no ID is provided, default to the first feature
      const defaultId = features[0].id;
      setCurrentFeature(defaultId);
      
      // Find the current feature data
      const featureData = features[0];
      setCurrentFeatureData(featureData);
      
      // Get related features
      const related = getRelatedFeatures(defaultId);
      setRelatedFeatures(related);
    }
  }, [id]); // Only re-run when id changes

  const handleFeatureNavClick = (featureId) => {
    // Navigate to the new feature
    navigate(`/feature-details/${featureId}`);
  };

  // CUSTOMIZATION: This is where you set your custom small images and descriptions
  // Simply modify these values directly here in the code
  const getCustomSmallImage = (featureId) => {
    // Return your custom image URL for each feature ID
    switch(featureId) {
      case 'ai-learning':
        return "https://i.pinimg.com/736x/fc/d8/31/fcd8310354601ee5a6f161324cee0ada.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      case 'interactive-discussions':
        return "https://i.pinimg.com/736x/fe/90/d1/fe90d16be8cadcbe894be1bd8090b682.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      case 'progress-tracking':
        return "https://i.pinimg.com/736x/4c/53/f9/4c53f96b88bed6b5f3e3791d553ad6eb.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      case 'self-paced':
        return "https://i.pinimg.com/736x/5a/da/ee/5adaee5244fe91375bcb78b6e28a0831.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      case 'coding-exercises':
        return "https://i.pinimg.com/736x/84/a1/64/84a1643634272fbb7a7591e3c70dde54.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      case 'video-lectures':
        return "https://i.pinimg.com/736x/2a/92/63/2a9263aa50a7ab656dd56cda59d5e3cb.jpg"; // REPLACE WITH YOUR ACTUAL URL
        
      default:
        return "/api/placeholder/200/150?text=Default"; // Default fallback
    }
  };
  
  // Custom descriptions for each feature
  const getCustomDescription = (featureId) => {
    // Return your custom description for each feature ID
    switch(featureId) {
      case 'ai-learning':
        return "Unlock a personalized learning experience! Our AI-powered system adapts to your learning style, ensuring the content is tailored to your pace and strengths. Say goodbye to one-size-fits-all learning and enjoy an experience designed just for you.";
        
      case 'interactive-discussions':
        return "Engage in meaningful discussions with your peers and instructors. Bigclasses.ai fosters an interactive learning environment where you can ask questions, share ideas, and collaborate on projects—ensuring you never learn in isolation.";
        
      case 'progress-tracking':
        return "Stay on track with our real-time progress tracking tools. You can easily monitor your learning milestones, set goals, and get immediate feedback on your performance, keeping you motivated and focused.";
        
      case 'self-paced':
        return "With Bigclasses.ai, you control your learning journey. Whether you prefer to speed through lessons or take your time, our flexible platform allows you to learn whenever and however works best for you.";
        
      case 'coding-exercises':
        return "Put theory into practice with hands-on coding exercises. Learn by doing and gain the confidence to apply your skills to real-world problems. Our interactive exercises help solidify your knowledge and improve problem-solving abilities.";
        
      case 'video-lectures':
        return "Access high-quality, HD video lectures anytime, anywhere. Our expert instructors break down complex topics into easy-to-understand lessons, ensuring that you can learn at your own pace while enjoying crystal-clear visuals and explanations.";
        
      default:
        return "This innovative feature is designed to enhance your educational experience and improve learning outcomes. With student-centered design and powerful capabilities, it becomes an essential part of your learning journey. Our users report significant improvements in comprehension and satisfaction when utilizing this feature in their studies.";
    }
  };

  // NEW: Get benefits for each feature
  const getFeatureBenefits = (featureId) => {
    switch(featureId) {
      case 'ai-learning':
        return [
          "Adaptive quizzes to reinforce weak areas.",
          "Intelligent reminders to keep you on track.",
          "Automated content recommendations based on your progress."
        ];
        
      case 'interactive-discussions':
        return [
          "Live Q&A sessions to resolve doubts instantly.",
          "Collaborative project spaces to work with fellow learners.",
          "Community forums moderated by experts to maintain quality discussions."
        ];
        
      case 'progress-tracking':
        return [
          "Detailed performance analytics to identify areas of improvement.",
          "Goal-setting tools with milestone reminders.",
          "Certificates of achievement to showcase your progress."
        ];
        
      case 'self-paced':
        return [
          "Offline access to lessons for uninterrupted learning.",
          "Customizable learning paths based on your goals.",
          "Pause and resume features for seamless transitions."
        ];
        
      case 'coding-exercises':
        return [
          "Real-time coding challenges with instant feedback.",
          "Scenario-based tasks to simulate real-world applications.",
          "Access to a sandbox environment for experimentation."
        ];
        
      case 'video-lectures':
        return [
          "Downloadable resources and notes for offline reference.",
          "Subtitles and multilingual support for wider accessibility.",
          "Bookmarks and timestamps for easy navigation."
        ];
        
      default:
        return [
          "Enhanced learning efficiency and retention.",
          "Improved engagement with course material.",
          "Greater flexibility in your educational journey."
        ];
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Add the additional styles */}
      <style>{additionalStyles}</style>
      
      {/* Include Navbar */}
      <Navbar />
      
      {/* Content area with padding to account for navbar */}
      <div className="pt-6">
        {/* Back button only */}
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Navigation sidebar for the features */}
        <div className="sticky-nav">
          <div className="nav-container">
            <div className="nav-scroller">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureNavClick(feature.id)}
                  className={`feature-nav-button ${
                    currentFeature === feature.id
                      ? "feature-nav-button-active"
                      : "feature-nav-button-inactive"
                  }`}
                >
                  <span>
                    {React.cloneElement(feature.icon, {
                      className: currentFeature === feature.id ? "text-white" : "text-primary",
                    })}
                  </span>
                  <span>{feature.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature content area */}
        <div className="container mx-auto px-4 py-6">
          {currentFeatureData && (
            <div className="feature-section feature-section-active custom-shadow">
              <div className="feature-content">
                <div className="feature-header">
                  <div className="feature-icon-container">{currentFeatureData.icon}</div>
                  <h2 className="feature-title">{currentFeatureData.title}</h2>
                </div>

                <div className="feature-image-container mb-8">
                  <img
                    src={currentFeatureData.image}
                    alt={currentFeatureData.title}
                    className="feature-image"
                  />
                </div>

                {/* Feature details with small image and description - USING DIRECT CUSTOM VALUES */}
                <div className="feature-details-container mb-8">
                  <div className="feature-details-layout">
                    <div className="feature-small-image">
                      <img 
                        src={getCustomSmallImage(currentFeature)}
                        alt={`${currentFeatureData.title} detail`}
                        className="rounded-md shadow-sm"
                      />
                    </div>
                    <div className="feature-extended-description">
                      <h3 className="text-xl font-semibold mb-3">About {currentFeatureData.title}</h3>
                      <p className="mb-4">{getCustomDescription(currentFeature)}</p>
                      
                      {/* NEW: Benefits Section */}
                      <div className="benefits-section">
                        <h4 className="benefits-title">Benefits:</h4>
                        <ul className="benefits-list">
                          {getFeatureBenefits(currentFeature).map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related features section */}
                <div className="related-features">
                  <h3>Related Features</h3>
                  <div className="related-cards">
                    {relatedFeatures.map((relatedFeature) => (
                      <div key={relatedFeature.id} className="related-card">
                        <div className="related-card-image">
                          <img src={relatedFeature.image} alt={relatedFeature.title} />
                        </div>
                        <div className="related-card-content">
                          <div className="related-card-icon">{relatedFeature.icon}</div>
                          <h4>{relatedFeature.title}</h4>
                          <p>{relatedFeature.description.substring(0, 100)}...</p>
                          <button 
                            className="learn-more-button"
                            onClick={() => handleFeatureNavClick(relatedFeature.id)}
                          >
                            Learn More
                            <ChevronRight className="learn-more-icon" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;