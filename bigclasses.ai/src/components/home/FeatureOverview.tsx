import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Layers, Headphones, Briefcase, Award, PlayCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../layout/Navbar";

// Define the feature data structure with MP4 videos for 3 features and images for Certifications
const subFeatures = [
  {
    id: "hands-on-projects",
    title: "Hands-on Projects",
    icon: <Layers className="h-6 w-6" />,
    description: "Apply your knowledge with real-world projects that build your portfolio and practical skills.",
    benefits: [
      "Our projects are designed based on real job roles and the skills that IT and AI companies are looking for .",
      "Students work on practical, real-world projects that match what companies actually use.",
      "We have a system that guides students to choose the right projects for their career goals.",
      "All projects are created after analyzing thousands of job listings to ensure they help students get hired."
    ],
    detailContent: "Our hands-on projects are designed to reinforce theoretical concepts through practical application. Each project simulates real-world scenarios you'll encounter in your professional career. From building machine learning models to developing full-stack applications, these projects will not only solidify your understanding but also provide valuable additions to your portfolio. Our instructors provide detailed feedback on your work, helping you identify areas for improvement and refine your approach to problem-solving.",
    mediaType: "video",
    videoSrc: "/images/projects.mp4",
  },
  {
    id: "mentor-support",
    title: "Mentor Support",
    icon: <Headphones className="h-6 w-6" />,
    description: "Get guidance and support from industry experts who are dedicated to your success.",
    benefits: [
      "1-on-1 mentorship and  mentoring sections with industry professionals.",
      "24/7 chat support on every class video using AI.",
      "Automated Assignments evaluation and code feedback using AI.",
      "Carreer Adivce and with industry professionals."
    ],
    detailContent: "Our mentorship program connects you with experienced professionals who are passionate about helping you succeed. Through scheduled 1-on-1 sessions, you'll receive personalized guidance tailored to your learning goals and career aspirations. Mentors provide code reviews, help troubleshoot challenges, and share valuable insights from their industry experience. This direct access to expertise accelerates your learning and helps you avoid common pitfalls as you progress through your educational journey.",
    mediaType: "video",
    videoSrc: "/images/mentor.mp4",
  },
  {
    id: "career-services",
    title: "Career Services",
    icon: <Briefcase className="h-6 w-6" />,
    description: "Prepare for your career with resume reviews, interview preparation, and job search strategies.",
    benefits: [
      "Resume and LinkedIn profile optimization to showcase your skills effectively.",
      "Mock interviews with feedback to prepare for technical and behavioral questions.",
      "Job search strategies, networking tips, and salary negotiation guidance.",
      "Comprehensive support to transition smoothly from education to employment."
    ],
    detailContent: "Our comprehensive career services are designed to bridge the gap between education and employment. We'll help you craft a compelling resume that highlights your newly acquired skills and projects. Our career coaches conduct mock interviews to prepare you for technical and behavioral questions. Additionally, we provide guidance on job search strategies, networking techniques, and salary negotiation. With our support, you'll be well-equipped to launch or advance your career in the tech industry.",
    mediaType: "video",
    videoSrc: "/images/services.mp4",
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: <Award className="h-6 w-6" />,
    description: "Earn industry-recognized certifications that validate your skills and enhance your credentials.",
    benefits: [
      "Earn industry-recognized credentials to enhance your resume.",
      "Validate your skills with certifications aligned to employer expectations.",
      "Access certification prep materials anytime for ongoing learning.",
      "Gain a competitive edge with sharable digital certificates."
    ],
    detailContent: "Our certification programs provide formal recognition of your expertise in specific domains. These credentials are designed to align with industry standards and employer expectations. Upon completing course requirements and passing the final assessment, you'll receive a digital certificate that can be shared on professional platforms like LinkedIn. Our certifications validate your knowledge and skills to potential employers, giving you a competitive edge in the job market and demonstrating your commitment to professional development.",
    mediaType: "image",
    imageSrc: [
      "/images/certificate_1.webp",
      "/images/certificate_2.webp"
    ]
  }
];

// CSS styles
const styles = `
  .features-container {
    padding: 2rem 0;
  }
  
  .features-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
    margin-bottom: 2rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .feature-nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-radius: 0.375rem;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-right: 0.5rem;
  }
  
  .feature-nav-item-active {
    background-color: #3b82f6;
    color: white;
  }
  
  .feature-nav-item-inactive {
    background-color: transparent;
    color: #1f2937;
  }
  
  .feature-nav-item-inactive:hover {
    background-color: #e5e7eb;
  }
  
  .feature-content {
    padding: 2rem;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .feature-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .feature-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background-color: #dbeafe;
    margin-right: 1rem;
  }
  
  .feature-icon svg {
    color: #3b82f6;
  }
  
  .feature-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }
  
  .feature-description {
    font-size: 1.125rem;
    color: #4b5563;
    margin-bottom: 1.5rem;
  }
  
  .content-layout {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .video-container {
    flex: 1;
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;
    background-color: #f0f0f0;
    aspect-ratio: 16/9;
  }
  
  .video-element {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .image-container {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 1rem;
    justify-content: space-between;

  }
  
  .cert-image {
    width: 47%;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .cert-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
  
  .right-content {
    flex: 1;
  }
  
  .benefits-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 4px solid #3b82f6;
    margin-bottom: 1.5rem;
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
  
  .feature-detail-content {
    line-height: 1.7;
  }
  
  /* Custom back button style */
  .back-button {
    background-color: #000;
    color: #fff;
    border-radius: 40px;
    padding: 0.5rem 0.5rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    border: none;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  // .back-button:hover {
  //   background-color: #333;
  //   transform: translateY(-2px);
  //   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  // }
  
  /* Video preloader styles */
  .video-preloader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .features-nav {
      flex-wrap: nowrap;
      justify-content: flex-start;
    }
    
    .content-layout {
      flex-direction: column;
    }
    
    .image-container {
      gap: 0.5rem;
      flex-direction: column;
    }
    
    .cert-image {
      width: 100%;
    }
  }
`;

// Improved video component with loading state
const VideoGif = ({ videoSrc }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pre-load the video when component mounts
  useEffect(() => {
    setIsLoading(true);
    
    // Create a new video element for preloading
    const preloadVideo = document.createElement('video');
    preloadVideo.src = videoSrc;
    preloadVideo.muted = true;
    preloadVideo.preload = 'auto';
    
    // Listen for data loaded event
    preloadVideo.onloadeddata = () => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play()
          .then(() => setIsLoading(false))
          .catch(err => {
            console.log("Autoplay prevented:", err);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    };
    
    // Handle errors
    preloadVideo.onerror = () => {
      console.error("Error loading video");
      setIsLoading(false);
    };
    
    // Start loading
    preloadVideo.load();
    
    return () => {
      preloadVideo.onloadeddata = null;
      preloadVideo.onerror = null;
    };
  }, [videoSrc]);
  
  return (
    <div className="video-container">
      {isLoading && (
        <div className="video-preloader">
          <RefreshCw className="h-8 w-8 text-blue-500 spinner" />
        </div>
      )}
      <video 
        ref={videoRef}
        className="video-element"
        muted
        playsInline
        loop={true}
        autoPlay={true}
        preload="auto"
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Images component for certifications
const CertificationImages = ({ images }) => {
  return (
    <div className="image-container">
      {images.map((src, index) => (
        <div key={index} className="cert-image">
          <img src={src} alt={`Certification example ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

const FeatureOverview = () => {
  const navigate = useNavigate();
  const { featureId } = useParams(); // Get the featureId from URL parameters
  const [activeFeature, setActiveFeature] = useState(subFeatures[0].id);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [key, setKey] = useState(0); // Key to force re-render of video component
  
  // Preload all videos when component mounts
  useEffect(() => {
    // Preload all videos in background
    subFeatures.forEach(feature => {
      if (feature.mediaType === "video") {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = feature.videoSrc;
        link.as = 'video';
        document.head.appendChild(link);
      }
    });
  }, []);

  // Effect to update activeFeature when featureId changes
  useEffect(() => {
    if (featureId && subFeatures.some(feature => feature.id === featureId)) {
      setActiveFeature(featureId);
      // Force re-render of video component by changing the key
      setKey(prevKey => prevKey + 1);
    }
  }, [featureId]);

  const handleFeatureClick = (featureId) => {
    if (activeFeature !== featureId) {
      setActiveFeature(featureId);
      // Update URL without reloading the page
      navigate(`/features/${featureId}`, { replace: true });
      // Force re-render of video component
      setKey(prevKey => prevKey + 1);
      
      // Smoothly scroll to content on mobile
      if (window.innerWidth < 768) {
        const contentElement = document.getElementById('feature-content');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Get the active feature data
  const activeFeatureData = subFeatures.find(feature => feature.id === activeFeature);

  // Render the appropriate media based on the feature type
  const renderMedia = () => {
    if (!activeFeatureData) return null;
    
    if (activeFeatureData.mediaType === "video") {
      return (
        <VideoGif 
          key={`video-${activeFeature}-${key}`}
          videoSrc={activeFeatureData.videoSrc}
        />
      );
    }
    // For certifications feature, we'll render the images in the main content area
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Add the custom styles */}
      <style>{styles}</style>
      
      {/* Include Navbar */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back button with new styling */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Our Features</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover the tools and services that will accelerate your learning journey and prepare you for success.
        </p>
        
        <div className="features-container">
          {/* Features Navigation */}
          <div className="features-nav">
            {subFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                className={`feature-nav-item ${
                  activeFeature === feature.id 
                    ? "feature-nav-item-active" 
                    : "feature-nav-item-inactive"
                }`}
              >
                <span className="mr-2">
                  {React.cloneElement(feature.icon, {
                    className: `h-5 w-5 ${activeFeature === feature.id ? "text-white" : "text-primary"}`,
                  })}
                </span>
                <span>{feature.title}</span>
              </button>
            ))}
          </div>
          
          {/* Feature Content */}
          {activeFeatureData && (
            <div id="feature-content" className="feature-content">
              <div className="feature-header">
                <div className="feature-icon">
                  {activeFeatureData.icon}
                </div>
                <h2 className="feature-title">{activeFeatureData.title}</h2>
              </div>
              
              <p className="feature-description">{activeFeatureData.description}</p>
              
              {/* Layout varies between video features and certification feature */}
              {activeFeatureData.mediaType === "video" ? (
                // Video features: Video (left) and Benefits (right) Layout
                <div className="content-layout">
                  {/* Left Side - Video */}
                  {renderMedia()}
                  
                  {/* Right Side - Benefits and Details */}
                  <div className="right-content">
                    {/* Benefits Section */}
                    <div className="benefits-section">
                      <h3 className="benefits-title">Key Benefits:</h3>
                      <ul className="benefits-list">
                        {activeFeatureData.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Detailed Content */}
                    <div className="feature-detail-content">
                      <p>{activeFeatureData.detailContent}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Certification feature: Images on top, Benefits and Details below
                <div>
                  {/* Certificates side by side */}
                  <CertificationImages images={activeFeatureData.imageSrc} />
                  
                  {/* Benefits Section */}
                  <div className="benefits-section">
                    <h3 className="benefits-title">Key Benefits:</h3>
                    <ul className="benefits-list">
                      {activeFeatureData.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Detailed Content */}
                  <div className="feature-detail-content">
                    <p>{activeFeatureData.detailContent}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureOverview;