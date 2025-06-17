import React from "react";
import { useEffect, useRef } from "react";

const ScrollingTicker = () => {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tickerContent = tickerRef.current;
    if (!tickerContent) return;

    const clone = tickerContent.innerHTML;
    tickerContent.innerHTML += clone;
  }, []);

  const announcements = [
    "🎓 New Batch Starting Soon - Join Now!",
    "🌟 Special Early Bird Discount - Limited Time Offer",
    "💼 100% Placement Assistance Available",
    "📚 Live Projects with Industry Experts",
    "🏆 Industry Recognized Certifications",
    "🤖 Latest AI & ML Curriculum Updates",
    // " New Batch Starting Soon - Join Now!",
    // "Special Early Bird Discount - Limited Time Offer",
    // "100% Placement Assistance Available",
    // "Live Projects with Industry Experts",
    // "Industry Recognized Certifications",
    // "Latest AI & ML Curriculum Updates",
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white overflow-hidden py-2">
      <div
        ref={tickerRef}
        className="whitespace-nowrap inline-block animate-scroll"
      >
        {announcements.map((announcement, index) => (
          <span key={index} className="inline-flex items-center">
            <span className="px-4">{announcement}</span>
            <span className="text-white/50 font-light">|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScrollingTicker;




