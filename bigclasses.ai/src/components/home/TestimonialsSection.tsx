import React, { useState, useEffect, useRef } from "react";

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slidesRef = useRef(null);
  
  // Array of testimonial images with paths updated to vimages folder
  const testimonialImages = [
    [
      {
        src: "/images/case1.webp",
        alt: "Student Testimonial 1"
      },
      {
        src: "/images/case7.webp",
        alt: "Student Testimonial 2"
      }
    ],
    [
      {
        src: "/images/case2.webp",
        alt: "Student Testimonial 3"
      },
      {
        src: "/images/case6.webp",
        alt: "Student Testimonial 4"
      }
    ],
    [
      {
        src: "/images/case3.webp",
        alt: "Student Testimonial 5"
      },
      {
        src: "/images/case10.webp",
        alt: "Student Testimonial 6"
      }
    ],
    [
      {
        src: "/images/case4.webp",
        alt: "Student Testimonial 7"
      },
      {
        src: "/images/case8.webp",
        alt: "Student Testimonial 8"
      }
    ],
    [
      {
        src: "/images/case5.webp",
        alt: "Student Testimonial 9"
      },
      {
        src: "/images/case9.webp",
        alt: "Student Testimonial 10"
      }
    ]
  ];

  // Clone first slide to the end for continuous looping effect
  const extendedSlides = [...testimonialImages, testimonialImages[0]];

  // Auto slide effect with smooth wrap-around
  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [currentSlide, isTransitioning]);

  // Handle the smooth transition when reaching the end
  useEffect(() => {
    if (currentSlide === extendedSlides.length - 1) {
      // When we reach the cloned first slide
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        // Disable transition temporarily and reset to first slide
        if (slidesRef.current) {
          slidesRef.current.style.transition = 'none';
        }
        setCurrentSlide(0);
        
        // Re-enable transitions after a small delay
        setTimeout(() => {
          if (slidesRef.current) {
            slidesRef.current.style.transition = 'transform 700ms ease-in-out';
          }
          setIsTransitioning(false);
        }, 50);
      }, 700); // Wait for transition to complete before resetting
      
      return () => clearTimeout(timer);
    }
  }, [currentSlide, extendedSlides.length]);

  // Function to go to next slide
  const nextSlide = () => {
    if (!isTransitioning) {
      setCurrentSlide(prev => prev === extendedSlides.length - 1 ? prev : prev + 1);
    }
  };

  // Function to go to previous slide (kept for future reference)
  const prevSlide = () => {
    if (currentSlide === 0) {
      // If at first slide, jump to the end clone first
      setIsTransitioning(true);
      setCurrentSlide(extendedSlides.length - 1);
      setTimeout(() => setIsTransitioning(false), 700);
    } else {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Function to go to a specific slide
  const goToSlide = (index) => {
    if (!isTransitioning) {
      setCurrentSlide(index);
    }
  };

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        {/* Testimonials Slider Section */}
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Student Testimonials
        </h2>

        {/* Testimonials Slider */}
        <div className="relative mb-20 overflow-hidden">
          {/* Navigation arrows removed as requested */}
          
          <div 
            ref={slidesRef}
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {extendedSlides.map((slide, slideIndex) => (
              <div key={slideIndex} className="min-w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {slide.map((image, imageIndex) => (
                    <div 
                      key={imageIndex} 
                      className="bg-white rounded-xl shadow-md p-4"
                    >
                      <div className="overflow-hidden rounded-lg">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full max-h-64 object-contain shadow-xl rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonialImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  (currentSlide === index || (currentSlide === extendedSlides.length - 1 && index === 0)) 
                    ? "bg-blue-600 w-8" 
                    : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Original Certifications Section - Untouched */}
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Get Certification
        </h2>
        <p className="text-lg text-gray-600 mb-16">
          Internships and Course certifications for <span className="text-blue-600 font-semibold">Enhanced Skill Validation</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Internship Certificate */}
          <div className="flex flex-col items-center">
            <img
              src="/lovable-uploads/certificate_1.webp"
              alt="Internship Certificate"
              className="w-full max-w-md h-auto rounded-lg shadow-lg"
            />
            <h3 className="text-xl font-semibold text-gray-800 mt-4">
              Internship Certificate
            </h3>
          </div>
          {/* Course Completion Certificate */}
          <div className="flex flex-col items-center">
            <img
              src="/lovable-uploads/certificate_2.webp"
              alt="Course Completion Certificate"
              className="w-full max-w-md h-auto rounded-lg shadow-lg"
            />
            <h3 className="text-xl font-semibold text-gray-800 mt-4">
              Course Completion Certificate
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;