import React, { useEffect } from "react";
import CourseOverview from "@/components/home/CourseOverview";
import Curriculum from "@/components/home/Curriculum";
import Highlights from "@/components/home/Highlights";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PlacementAssistance from "@/components/home/PlacementAssistance";
import CTASection from "@/components/home/CTASection"; 
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
const CourseDetails: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="bg-white min-h-screen antialiased">
      <Navbar />
        <Highlights />
        <CourseOverview />
        <Curriculum />
        <TestimonialsSection />
        <PlacementAssistance />
        <CTASection /> 
        <Footer />
    </div>
  );
};

export default CourseDetails;