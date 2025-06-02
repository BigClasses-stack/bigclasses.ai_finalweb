import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  // Use regular YouTube watch URL instead of embed URL
  const youtubeVideoLink = "https://www.youtube.com/watch?v=4MetEXswZtw&t=15s"; // Replace with your actual YouTube video link

  const openVideoModal = () => {
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };
  
  // Function to open YouTube in a new tab/window
  const openYouTubeVideo = () => {
    window.open(youtubeVideoLink, '_blank');
  };

  // Function to navigate to the EnrollPage
  const openEnrollPage = () => {
    navigate("/enrollnow");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 z-0">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-white/5 rounded-full filter blur-2xl animate-pulse-glow"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to transform your learning journey?</h2>
                <p className="text-lg mb-8 text-white/90">
                  Join thousands of learners who are already experiencing the future of education with our AI-powered platform.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 mb-8">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8 group relative overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    onClick={openEnrollPage}
                  >
                    <span className="relative z-10 flex items-center">
                      Enroll now
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-white to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8 group relative overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    onClick={openVideoModal}
                  >
                    <span className="relative z-10 flex items-center">
                      <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Watch demo
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-white to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 bg-white/20 rounded-lg blur-lg"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&h=400" 
                    alt="Student learning with AI" 
                    className="w-full h-auto rounded-lg shadow-2xl relative z-10"
                  />
                  <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <img 
                      src="/lovable-uploads/88d0f792-1f12-4f5e-9665-edc435ac38fa.png" 
                      alt="BigClasses.AI Logo" 
                      className="h-12 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center flex-wrap gap-6 pt-6 mt-4 border-t border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt={`User ${i}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-semibold">
                  +2k
                </div>
              </div>
              <p className="text-white/80">
                Join over <span className="font-bold text-white">2,000+</span> students who are already learning with us
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md p-6 md:p-8 bg-white rounded-xl shadow-2xl">
            <Button 
              onClick={closeVideoModal}
              className="absolute -top-4 -right-4 bg-white text-gray-800 hover:bg-gray-100 rounded-full shadow-lg"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Watch Demo Video</h3>
              <p className="text-gray-600 mb-6">
                Click the button below to watch our demo video on YouTube.
              </p>
              
              <Button 
                onClick={openYouTubeVideo}
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                Open on YouTube
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CTASection;