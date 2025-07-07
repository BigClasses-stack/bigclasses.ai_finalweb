import React, { useState } from 'react';
import { Calendar, Clock, Users, Award, CheckCircle, Star, Play, Globe, Shield, TrendingUp, BookOpen, MessageCircle } from 'lucide-react';
import WebinarRegistrationForm from './webinar_registration_form';

const SuccessModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-4 sm:max-w-sm sm:p-6 relative text-center">
        {/* Reduced max-w-md to max-w-xs and p-8 to p-4 */}
        <button
          className="absolute top-2 right-3 text-xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <div className="flex flex-col items-center gap-2">
          <div className="text-green-500 text-3xl mb-1">✔️</div>
          <h2 className="text-xl font-bold mb-1">Enrollment Successful!</h2>
          <div className="text-green-600 text-base font-semibold mb-1">Thank you for enrolling!</div>
          <div className="text-gray-700 mb-2 text-sm">
            Kindly check your registered email .
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm"
            onClick={onClose}
          >Close</button>
        </div>
      </div>
    </div>
  );
};

const DataEngineerWebinar = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // FAQ Accordion Component
  const FaqAccordion = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl bg-white shadow-lg">
            <button
              className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-800 focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              aria-expanded={openIndex === idx}
            >
              <span>{faq.question}</span>
              <span className="text-purple-600 text-2xl">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 mx-2 sm:mx-0 relative font-sans">
            {/* Add font-sans here */}
            <button
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >×</button>
            <WebinarRegistrationForm
              onSuccess={() => {
                setShowModal(false);
                setShowSuccess(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="\lovable-uploads\Big_Classes_LOGO.webp"
              alt="BigClasses.AI Logo"
              className="h-10 w-auto"

              style={{ maxHeight: 44 }}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all duration-300 text-base"
          >
            Register Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-50 rounded-full px-4 py-2 text-blue-700 font-semibold shadow text-base sm:text-lg">
              🎓 Free 2-Day Live Webinar
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-lg">
              Data Engineering
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Career Masterclass</span>
            </h1>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-base sm:text-lg text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={22} />
                <span>12th & 13th July 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-blue-600" size={22} />
                <span>Live Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-blue-600" size={22} />
                <span>Free E-Certificate</span>
              </div>
            </div>
            <a
              href="#register"
              onClick={e => { e.preventDefault(); setShowModal(true); }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              Register Now
              <Users size={20} className="sm:hidden" />
              <Users size={24} className="hidden sm:inline" />
            </a>
            <div className="text-base sm:text-lg text-gray-600 mt-2">
              <span className="font-bold text-blue-600">Limited to 300 seats</span> – Secure your spot today!
            </div>
          </div>
          <div className="relative mt-8 md:mt-0">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transform rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-blue-100">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 mb-6 flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-5 mb-4">
                  <Play className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Live Interactive Session</h3>
                <p className="text-center text-gray-600">Join 300+ aspiring Data Engineers</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Real-time Q&A with industry experts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">Hands-on project demo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">Free certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Attend Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Why Attend This Data Engineering Webinar?</h2>
            <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Discover the roadmap to becoming a Data Engineer. Learn to build scalable data pipelines, master ETL, and get career guidance from BigClasses experts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100">
              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <BookOpen className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">For Beginners</h3>
              <p className="text-gray-600">Kickstart your journey in data engineering with foundational concepts and tools.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100">
              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">For Professionals</h3>
              <p className="text-gray-600">Upgrade your skills with the latest in cloud data engineering and real-world projects.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100">
              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Career Switchers</h3>
              <p className="text-gray-600">Get a step-by-step roadmap to transition into high-paying data engineering roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">What You'll Learn</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-6">
              {[
                'Introduction to Data Engineering & Modern Data Stack',
                'Building ETL Pipelines: Concepts & Tools',
                'Data Warehousing & Cloud Platforms (Azure, AWS, GCP)',
                'Real-Time Data Processing Use Cases'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                  <CheckCircle className="text-blue-600" size={22} />
                  <span className="text-lg font-semibold text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                'Resume & Interview Preparation for Data Engineering',
                'Career Roadmap: How to Land Your First Data Engineer Job',
                'Live Q&A with BigClasses Experts'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-400">
                  <CheckCircle className="text-blue-400" size={22} />
                  <span className="text-lg font-semibold text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Details */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Webinar Details</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              <div className="text-center">
                <Calendar size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Dates</h3>
                <p className="text-lg">12th–13th July 2025</p>
              </div>
              <div className="text-center">
                <Clock size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Time</h3>
                <p className="text-lg">6 PM – 8 PM IST</p>
              </div>
              <div className="text-center">
                <Globe size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Mode</h3>
                <p className="text-lg">Live Online</p>
              </div>
              <div className="text-center">
                <Award size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Certification</h3>
                <p className="text-lg">Free E-Certificate</p>
              </div>
              <div className="text-center">
                <Shield size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Cost</h3>
                <p className="text-lg">100% Free</p>
              </div>
              <div className="text-center">
                <Users size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Seats</h3>
                <p className="text-lg">Limited to 300</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Trainer */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Meet Your Trainer</h2>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center">
                    <span className="text-6xl">👨‍💻</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2"></h3>
                <p className="text-blue-600 font-semibold mb-4">12+ years of industry experience in AI</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">10+ Years of Data Engineering Experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Delivered 50+ Webinars & Workshops</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Cloud Data Platform Specialist</span>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl mt-6">
                  <p className="text-gray-700 italic text-lg">
                    "I'll help you understand complex data workflows in simple, real-world language."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section (replaced with button to open modal) */}
      <section id="register" className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Reserve Your Free Seat</h2>
            <p className="text-base sm:text-xl text-white font-semibold">🚨 Only 300 seats available – fill the form to reserve your spot!</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-white text-blue-700 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-xl text-base sm:text-lg hover:bg-blue-100 transition-all duration-300"
            >
              Open Registration Form
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose BigClasses */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Why Choose BigClasses?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Star size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn from Industry Experts</h3>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Hands-on Learning</h3>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Career-Oriented Sessions</h3>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Award size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Free Certificate & Job Roadmap</h3>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Data Engineering Webinar – FAQs</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Got questions about the Data Engineering webinar? Check our FAQs below or email us at <a href="mailto:info@bigclasses.com" className="text-purple-600 underline">info@bigclasses.com</a>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">About the Webinar</h3>
              <FaqAccordion faqs={[
                {
                  question: "Who should attend this Data Engineering webinar?",
                  answer: "Anyone interested in starting or advancing a career in data engineering, including students, professionals, and career switchers."
                },
                {
                  question: "Is the webinar really free?",
                  answer: "Yes! The webinar is 100% free and open to all, but seats are limited."
                },
                {
                  question: "Will I get a certificate?",
                  answer: "Yes, all attendees will receive a free e-certificate from BigClasses after the webinar."
                }
              ]} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Learning & Participation</h3>
              <FaqAccordion faqs={[
                {
                  question: "What topics will be covered?",
                  answer: "The webinar covers data engineering fundamentals, ETL, cloud platforms, real-world projects, and career guidance."
                },
                {
                  question: "Will there be a Q&A session?",
                  answer: "Absolutely! You can ask questions live and get answers from our expert trainer."
                },
                {
                  question: "How do I join the webinar?",
                  answer: "After registration, you'll receive a confirmation email with the joining link and instructions."
                }
              ]} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-xl sm:text-2xl font-bold mb-4">BigClasses</div>
          <p className="text-gray-400 mb-4">Empowering careers through expert-led technology training</p>
          <p className="text-xs sm:text-sm text-gray-500">© 2025 BigClasses. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DataEngineerWebinar;