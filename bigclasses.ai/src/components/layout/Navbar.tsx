import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileFeatureDropdownOpen, setMobileFeatureDropdownOpen] = useState(false);
  const [mobileCourseDropdownOpen, setMobileCourseDropdownOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
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
      `}</style>

      <nav className="bg-white py-6 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
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
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex justify-center flex-1 items-center space-x-8">
            <button
              onClick={() => {
                navigate("/#");
                setTimeout(() => handleScrollTo("hero"), 0);
              }}
              className="text-black hover:text-blue-500 transition-colors"
            >
              Home
            </button>

            <div className="relative group">
              <a
                href="#courses"
                className="text-black hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>Courses</span>
                <svg
                  className="w-4 h-4 mt-[2px] transform group-hover:rotate-180 transition-transform"
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
                  href="/course-details/1"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Python Programming
                </a>
                <a
                  href="/course-details/2"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Machine Learning
                </a>
                <a
                  href="/course-details/3"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Deep Learning
                </a>
                <a
                  href="/course-details/4"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  NLP
                </a>
                <a
                  href="/course-details/5"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Generative AI
                </a>
                <a
                  href="/course-details/6"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  LangChain
                </a>
                <a
                  href="/course-details/7"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  LangGraph
                </a>
                <a
                  href="/course-details/8"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  MLOps
                </a>
                <a
                  href="/course-details/9"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  LLMOps
                </a>
                <a
                  href="/course-details/10"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Agents
                </a>
                <a
                  href="/course-details/11"
                  className="block px-6 py-3 hover:bg-gray-100 text-sm text-gray-800"
                >
                  Ethics in AI and Scaling AI systems
                </a>
              </div>
            </div>

            <div className="relative group">
              <a
                href="#features"
                className="text-black hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>Features</span>
                <svg
                  className="w-4 h-4 mt-[2px] transform group-hover:rotate-180 transition-transform"
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

            <a href="#testimonials" className="text-black hover:text-primary transition-colors">
              Testimonials
            </a>
          </div>

          {/* Right Auth Buttons - Now easily customizable */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="rounded-full px-6" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleStartNowClick}
                className="vibrate-button gradient-button-primary rounded-full px-6 py-2 font-medium"
              >
                ⭐ Start Now
              </Button>
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
                    <a
                      href="/course-details/1"
                      className="text-gray-700 hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Python Programming
                    </a>
                    <a
                      href="/course-details/2"
                      className="text-gray-700 hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Machine Learning
                    </a>
                    <a
                      href="/course-details/3"
                      className="text-gray-700 hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Deep Learning
                    </a>
                    <a
                      href="/course-details/4"
                      className="text-gray-700 hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      NLP
                    </a>
                    <a
                      href="/course-details/5"
                      className="text-gray-700 hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Generative AI
                    </a>
                    <a
                      href="#courses"
                      className="text-blue-600 font-medium"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setMobileCourseDropdownOpen(false);
                      }}
                    >
                      View All Courses
                    </a>
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

              <a
                href="#testimonials"
                className="text-black hover:text-primary transition-colors py-2"
                onClick={toggleMenu}
              >
                Testimonials
              </a>
              <div className="flex flex-col space-y-3 pt-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-4">
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
                    <Button
                      onClick={() => {
                        handleStartNowClick();
                        setIsMenuOpen(false);
                      }}
                      className="vibrate-button gradient-button-secondary rounded-full w-full font-medium"
                    >
                      ⭐ Start Now
                    </Button>
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

      {/* Floating Enroll Now Button - Now easily customizable */}
      {!isLoggedIn && showFloatingButton && (
        <div className="fixed bottom-20 right-6 z-50">
          <Button
            className="vibrate-button gradient-button-floating rounded-full px-4 py-2 text-sm font-medium hover:shadow-xl"
            onClick={() => navigate("/signup")}
          >
            🚀 Enroll Now
          </Button>
        </div>
      )}
    </>
  );
};

export default Navbar;