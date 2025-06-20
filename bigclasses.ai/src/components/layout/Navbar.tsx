import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import startNowAnimation from "../../assets/animations/start_now_animation.json";
import StudentChatbot from "@/components/StudentChatbot";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileFeatureDropdownOpen, setMobileFeatureDropdownOpen] = useState(false);
  const [mobileCourseDropdownOpen, setMobileCourseDropdownOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingButton(scrollY >= 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setMobileFeatureDropdownOpen(false);
    setMobileCourseDropdownOpen(false);
  };
  const toggleMobileCourseDropdown = () => {
    setMobileCourseDropdownOpen(!mobileCourseDropdownOpen);
  };
  const toggleMobileFeatureDropdown = () => {
    setMobileFeatureDropdownOpen(!mobileFeatureDropdownOpen);
  };
  const togglePhoneDropdown = () => {
    setIsPhoneDropdownOpen(!isPhoneDropdownOpen);
  };
  const handleScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/#");
  };

  const handleFeatureClick = (featureId: string) => {
    navigate(`/features/${featureId}`);
    setIsMenuOpen(false);
    setMobileFeatureDropdownOpen(false);
  };

  const handleStartNowClick = () => {
    navigate("/signup");
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
    setIsPhoneDropdownOpen(false);
  };

  const handleContactClick = () => {
    setIsPhoneDropdownOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    navigate('/#');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }, 100);
  };

  return (
    <>
      <style>{`
        @keyframes smoothVibration {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-2px); }
          50% { transform: translateY(0px); }
          75% { transform: translateY(2px); }
        }
        .vibrate-button {
          animation: smoothVibration 1s ease-in-out infinite;
        }
        .vibrate-button:hover {
          animation: smoothVibration 0.4s ease-in-out infinite;
        }
        
        /* Custom gradient button styles - now customizable */
        .gradient-button-primary {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          color: white;
          transition: all 0.3s ease;
        }
        .gradient-button-primary:hover {
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
          transform: translateY(-1px) scale(1.05);
        }
        
        .gradient-button-secondary {
          background: linear-gradient(45deg, #8360c3, #2ebf91);
          box-shadow: 0 4px 15px rgba(131, 96, 195, 0.4);
          color: white;
          transition: all 0.3s ease;
        }
        
        .gradient-button-floating {
          background: linear-gradient(45deg, #00ffff, #ff00ff);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          color: white;
          transition: all 0.3s ease;
        }
        .gradient-button-floating:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(255, 107, 107, 0.6);
        }

        /* Phone floating button styles - Updated for smaller size */
        .phone-floating-button {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a855f7);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
          color: white;
          transition: all 0.3s ease;
          animation: phoneVibration 2s ease-in-out infinite;
          border-radius: 50% 50% 50% 0%;
          position: relative;
        }
        .phone-floating-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(139, 92, 246, 0.7);
          animation: phoneVibrationFast 0.5s ease-in-out infinite;
        }
        .phone-floating-button:active {
          transform: scale(1.05);
        }

        @keyframes phoneVibration {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-3px); }
          50% { transform: translateY(0px); }
          75% { transform: translateY(3px); }
        }

        @keyframes phoneVibrationFast {
          0%, 100% { transform: translateY(0px) scale(1.1); }
          25% { transform: translateY(-2px) scale(1.1); }
          50% { transform: translateY(0px) scale(1.1); }
          75% { transform: translateY(2px) scale(1.1); }
        }

        /* Phone dropdown styles */
        .phone-dropdown {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .phone-dropdown-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .phone-number-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background-color 0.2s ease;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }

        .phone-number-item:hover {
          background-color: #f8fafc;
        }

        .phone-number-item:last-child {
          border-bottom: none;
        }

        .phone-icon {
          background: #10b981;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
<nav className="bg-white py-2 sticky top-0 z-50 shadow-sm">
  <div className="w-full px-4 md:px-8 flex items-center justify-between">
    {/* Logo - adjusted margin */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          navigate("/#");
          setTimeout(() => handleScrollTo("hero"), 0);
        }}
        className="flex items-center gap-2"
      >
        <img
          src="\lovable-uploads\Big_Classes_LOGO.webp"
          alt="BigClasses.AI Logo"
          className="h-10 w-auto"
        />
      </button>
    </div>

    {/* Center Nav Links - adjusted spacing and width */}
    <div className="hidden md:flex justify-center items-center space-x-12 flex-1 max-w-3xl mx-auto px-4">
      <button
        onClick={() => {
          navigate("/#");
          setTimeout(() => handleScrollTo("hero"), 0);
        }}
        className="text-black hover:text-blue-500 transition-colors whitespace-nowrap"
      >
        Home
      </button>
      <div className="relative group">
        <a
          href="#courses"
          className="text-black hover:text-primary transition-colors flex items-center space-x-2 whitespace-nowrap"
        >
          <span>Courses</span>
          <svg
            className="w-4 h-4 transform group-hover:rotate-180 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </a>
        <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-lg rounded-md border border-gray-100 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          <a
            href="/course-details/data-analytics"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Data Analytics
          </a>
          <a
            href="/course-details/python-programming"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Python Programming 
          </a>
          <a
            href="/course-details/machine-learning"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Machine Learning
          </a>
          <a
            href="/course-details/deep-learning"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Deep Learning
          </a>
          <a
            href="/course-details/natural-language-processing"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Natural Language Processing (NLP)
          </a>
          <a
            href="/course-details/generative-ai"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
           Generative AI
          </a>
          <a
            href="/course-details/langchain"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Langchain
          </a>
          <a
            href="/course-details/langgraph"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            LangGraph
          </a>
          <a
            href="/course-details/mlops"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            MLOps
          </a>
          <a
            href="/course-details/llmops"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            LLMOps
          </a>
         
          <a
            href="/course-details/ai-agents"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Agents
          </a>
            <a
            href="/course-details/ai-ethics"
            className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Ethics AI and Scaling AI system
          </a>
        </div>
      </div>

      <div className="relative group">
        <a
          href="#features"
          className="text-black hover:text-primary transition-colors flex items-center space-x-2 whitespace-nowrap"
        >
          <span>Features</span>
          <svg
            className="w-4 h-4 transform group-hover:rotate-180 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </a>
        <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-md border border-gray-100 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          {/* Feature links that navigate to specific feature tabs */}
          <button
            onClick={() => handleFeatureClick("hands-on-projects")}
            className="block w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Hands-on Projects
          </button>
          <button
            onClick={() => handleFeatureClick("mentor-support")}
            className="block w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Mentor Support
          </button>
          <button
            onClick={() => handleFeatureClick("career-services")}
            className="block w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Career Services
          </button>
          <button
            onClick={() => handleFeatureClick("certifications")}
            className="block w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
          >
            Certifications
          </button>
          {/* Link to view all features */}
          <button
            onClick={() => navigate("/features")}
            className="block w-full text-left px-6 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-blue-600"
          >
            View All Features
          </button>
        </div>
      </div>
      <button
        onClick={() => handleScrollToSection('testimonials')}
        className="text-black hover:text-primary transition-colors whitespace-nowrap"
      >
        Testimonials
      </button>
    </div>

    {/* Right Auth Buttons - adjusted margin */}
    <div className="hidden md:flex items-center ml-4">
      {isLoggedIn ? (
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="rounded-full px-6" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="w-32 h-16 flex items-center"> {/* Changed width from w-24 to w-32 */}
          <Lottie 
            animationData={startNowAnimation}
            loop={true}
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('svg')) {
                handleStartNowClick();
              }
            }}
          />
        </div>
      )}
    </div>

    {/* Mobile Menu Button */}
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleMenu}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>
    </div>
  </div>

  {/* Mobile Dropdown Menu */}
  {isMenuOpen && (
    <div className="md:hidden bg-white py-6 px-4 shadow-lg">
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => handleScrollTo("home")}
          className="text-left text-black hover:text-blue-500 transition-colors py-2"
        >
          Home
        </button>
        {/* Courses dropdown for mobile */}
        <div className="py-2">
          <button
            onClick={toggleMobileCourseDropdown}
            className="w-full text-left flex items-center justify-between text-black hover:text-blue-500 transition-colors"
          >
            <span>Courses</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${mobileCourseDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileCourseDropdownOpen && (
            <div className="pl-4 flex flex-col space-y-2 mt-2">
              <button
                className="text-left text-gray-700 hover:text-blue-500"
                onClick={() => {
                  navigate("/course-details/data-analytics");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                Data Analytics
              </button>
              <button
                className="text-left text-gray-700 hover:text-blue-500"
                onClick={() => {
                  navigate("/course-details/python-programming");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                Python Programming
              </button>
              <button
                className="text-left text-gray-700 hover:text-blue-500"
                onClick={() => {
                  navigate("/course-details/machine-learning");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                Machine Learning
              </button>
              <button
                className="text-left text-gray-700 hover:text-blue-500"
                onClick={() => {
                  navigate("/course-details/deep-learning");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                Deep Learning
              </button>
              <button
                className="text-left text-gray-700 hover:text-blue-500"
                onClick={() => {
                  navigate("/course-details/natural-language-processing");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                NLP
              </button>
              <button
                className="text-left text-blue-600 font-medium"
                onClick={() => {
                  handleScrollTo("courses");
                  setIsMenuOpen(false);
                  setMobileCourseDropdownOpen(false);
                }}
              >
                View All Courses
              </button>
            </div>
          )}
        </div>

        {/* Features dropdown for mobile - Now toggleable */}
        <div className="py-2">
          <button
            onClick={toggleMobileFeatureDropdown}
            className="w-full text-left flex items-center justify-between text-black hover:text-blue-500 transition-colors"
          >
            <span>Features</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${mobileFeatureDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileFeatureDropdownOpen && (
            <div className="pl-4 flex flex-col space-y-2 mt-2">
              <button
                onClick={() => handleFeatureClick("hands-on-projects")}
                className="text-left text-gray-700 hover:text-blue-500"
              >
                Hands-on Projects
              </button>
              <button
                onClick={() => handleFeatureClick("mentor-support")}
                className="text-left text-gray-700 hover:text-blue-500"
              >
                Mentor Support
              </button>
              <button
                onClick={() => handleFeatureClick("career-services")}
                className="text-left text-gray-700 hover:text-blue-500"
              >
                Career Services
              </button>
              <button
                onClick={() => handleFeatureClick("certifications")}
                className="text-left text-gray-700 hover:text-blue-500"
              >
                Certifications
              </button>
              <button
                onClick={() => {
                  navigate("/features");
                  setIsMenuOpen(false);
                  setMobileFeatureDropdownOpen(false);
                }}
                className="text-left font-medium text-blue-600"
              >
                View All Features
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => handleScrollToSection('testimonials')}
          className="text-black hover:text-primary transition-colors py-2 w-full text-left sm:text-center"
        >
          Testimonials
        </button>
        <div className="flex flex-col items-start sm:items-center space-y-4 pt-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center space-x-3">
                <img
                  src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <Button
                className="rounded-full w-full"
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex flex-col space-y-3">
              <div className="w-32 h-16 mx-auto flex items-center"> {/* Changed width from w-24 to w-32 */}
                <Lottie 
                  animationData={startNowAnimation}
                  loop={true}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('svg')) {
                      handleStartNowClick();
                      setIsMenuOpen(false);
                    }
                  }}
                />
              </div>
              <div className="text-center py-2 text-gray-600 text-sm">
                Welcome! Ready to begin your learning journey?
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</nav>

{/* Floating Contact Buttons - All on right, equally spaced */}
      {!isLoggedIn && showFloatingButton && (
        <>
          <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end space-y-4">
            {/* Chatbot button and window - now first */}
            <StudentChatbot />
            {/* Phone Contact Button - now second */}
            <div className="relative">
              <Button
                onClick={togglePhoneDropdown}
                className="phone-floating-button w-12 h-12 p-0 flex items-center justify-center shadow-2xl"
              >
                <Phone size={20} />
              </Button>
              {isPhoneDropdownOpen && (
                <div className="phone-dropdown absolute bottom-16 right-0 w-64 mb-2">
                  <div className="phone-dropdown-header">
                    <span className="font-medium">Call Us (Or) WhatsApp Us</span>
                    <button 
                      onClick={togglePhoneDropdown}
                      className="close-button"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="phone-number-item" onClick={() => handlePhoneCall('+919666523199')}>
                    <div className="phone-icon">
                      <Phone size={16} />
                    </div>
                    <span className="font-medium text-gray-800">+91 9666523199</span>
                  </div>
                </div>
              )}
            </div>
            {/* Enroll Now Button - now last */}
            <Button
              className="vibrate-button gradient-button-floating rounded-full px-4 py-2 text-sm font-medium hover:shadow-xl"
              onClick={() => navigate("/signup")}
            >
              🚀 Enroll Now
            </Button>
          </div>
        </>
      )}
    </>
  );
};


export default Navbar;