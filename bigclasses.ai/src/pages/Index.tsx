import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesSection from "@/components/home/CoursesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import Welcome from "@/components/home/welcome";
import PlacementAssistance from "@/components/home/PlacementAssistance";
const Index = () => {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach((section) => {
      if (!section.classList.contains("animate-fade-in")) {
        section.style.opacity = "0";
        observer.observe(section);
      }
    });
    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <Welcome />
        <CoursesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PlacementAssistance />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
export default Index;