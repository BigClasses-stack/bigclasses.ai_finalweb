import React, { useState } from 'react';
import { Calendar, Clock, Users, Award, CheckCircle, Star, Play, Globe, Shield, TrendingUp, BookOpen, MessageCircle } from 'lucide-react';

const AzureWebinarLanding = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registration submitted successfully! You will receive confirmation details soon.');
  };

  // FAQ Accordion Component
  const FaqAccordion: React.FC<{ faqs: { question: string; answer: string }[] }> = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl bg-white">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-600">
            BigClasses.AI
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Register Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 text-purple-700 font-semibold">
              🎓 Free 2-Day Live Webinar
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
              Azure Data Engineering
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> – Learn from Experts & Get Certified!</span>
            </h1>
            
            <div className="flex flex-wrap gap-4 text-lg text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-600" size={20} />
                <span>📅 12th & 13th July 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-blue-600" size={20} />
                <span>💻 Live Online Session</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-pink-600" size={20} />
                <span>🧾 Free E-Certificate</span>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
              👉 Register Now – Limited Seats
              <Users size={20} />
            </button>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4">
                    <Play className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Live Interactive Session</h3>
                <p className="text-center text-gray-600">Join 300+ students learning Azure Data Engineering</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                  <span className="text-gray-700">Real-time Q&A with experts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-blue-600" size={16} />
                  </div>
                  <span className="text-gray-700">Hands-on demonstrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={16} />
                  </div>
                  <span className="text-gray-700">Free certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Attend Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Attend This Webinar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to start a high-demand career in Data Engineering? Learn to build powerful data pipelines using Azure tools like Data Factory, Synapse, and more – guided by industry experts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">For Freshers</h3>
              <p className="text-gray-600">Perfect introduction to data engineering concepts and Azure cloud services</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">For Professionals</h3>
              <p className="text-gray-600">Upskill your career with in-demand Azure data engineering skills</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-pink-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Career Switchers</h3>
              <p className="text-gray-600">Complete roadmap to transition into high-paying data engineering roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                'Introduction to Azure Data Services',
                'Azure Data Factory & Synapse Analytics',
                'Real-Time Data Pipeline Use Cases'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">✅ {item}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              {[
                'Resume & Interview Preparation Tips',
                'Roadmap to Get Your First Data Engineering Job'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">✅ {item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Webinar Details</h2>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <Calendar size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">📅 Dates</h3>
                <p className="text-lg">12th–13th July 2025</p>
              </div>
              
              <div className="text-center">
                <Clock size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">⏰ Time</h3>
                <p className="text-lg">6 PM – 8 PM IST</p>
              </div>
              
              <div className="text-center">
                <Globe size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">🌐 Mode</h3>
                <p className="text-lg">Live Online</p>
              </div>
              
              <div className="text-center">
                <Award size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">🎓 Certification</h3>
                <p className="text-lg">Free E-Certificate</p>
              </div>
              
              <div className="text-center">
                <Shield size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">💸 Cost</h3>
                <p className="text-lg">100% Free</p>
              </div>
              
              <div className="text-center">
                <Users size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">👥 Seats</h3>
                <p className="text-lg">Limited to 300</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Trainer */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Your Trainer</h2>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center">
                    <span className="text-6xl">👨‍💻</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Varun Kumar</h3>
                <p className="text-purple-600 font-semibold mb-4">Senior Data Engineer | Microsoft Certified Trainer</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">10+ Years of Industry Experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Delivered 50+ Webinars & Workshops</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Microsoft Azure Certified Expert</span>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mt-6">
                  <p className="text-gray-700 italic text-lg">
                    "I'll help you understand complex cloud data workflows in simple, real-world language."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Register Now – Form Section</h2>
            <p className="text-xl text-red-600 font-semibold">🚨 Only 300 seats available – fill the form to reserve your spot!</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number (WhatsApp preferred) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Educational Background</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300"
                  >
                    <option value="">Select your education</option>
                    <option value="BTech/BE">BTech/BE</option>
                    <option value="MCA">MCA</option>
                    <option value="BSc">BSc</option>
                    <option value="MSc">MSc</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Current Role/Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300"
                >
                  <option value="">Select your current status</option>
                  <option value="Student">Student</option>
                  <option value="Fresher">Fresher</option>
                  <option value="0-2 years">Working Professional (0-2 years)</option>
                  <option value="2-5 years">Working Professional (2-5 years)</option>
                  <option value="5+ years">Working Professional (5+ years)</option>
                  <option value="Career Switch">Looking for Career Switch</option>
                </select>
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                🔒 Register for Free Webinar
                <Shield size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BigClasses.AI */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose BigClasses.AI?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Star size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">💡 Learn from Certified Industry Experts</h3>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">📁 Hands-on Learning with Real Use Cases</h3>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">📈 Career-Oriented Sessions</h3>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Award size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">🎓 Free Certificate + Job Roadmap</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">🚀 Don't miss out on this career-changing opportunity!</h2>
            <h3 className="text-2xl font-semibold mb-4">🎓 2-Day Free Webinar on Azure Data Engineering</h3>
            <p className="text-xl mb-8">📅 12th & 13th July 2025 | Live Online</p>
            <p className="text-lg mb-8">📝 Limited Seats – Register Now!</p>
            
            <button className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              👉 Register Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">BigClasses.AI</div>
          <p className="text-gray-400 mb-4">Empowering careers through expert-led technology training</p>
          <p className="text-sm text-gray-500">© 2025 BigClasses.AI. All rights reserved.</p>
        </div>
      </footer>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">WSA Webinar – FAQs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              As a participant we are pretty sure you will have a lot of questions about our webinars. We tried to cover them in the form of Frequently Asked Questions (FAQ) mentioned below. If you still have questions feel free to reach us at <a href="mailto:edtech.events.manager@webstackacademy.com" className="text-purple-600 underline">edtech.events.manager@webstackacademy.com</a>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Webinar Content - FAQs */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Webinar Content - FAQs</h3>
              <FaqAccordion faqs={[
                {
                  question: "What is a Master Class webinar?",
                  answer: "A Master Class webinar is an in-depth, expert-led session focusing on a specific topic, designed to provide advanced knowledge and practical insights."
                },
                {
                  question: "What is a Course Demo Webinar?",
                  answer: "A Course Demo Webinar gives you a preview of our full courses, including teaching style, curriculum highlights, and hands-on demonstrations."
                },
                {
                  question: "Why are you offering these webinars for free?",
                  answer: "We believe in democratizing tech education and want to help learners experience our teaching quality before enrolling in paid programs."
                }
              ]} />
            </div>
            {/* Webinar Speaker - FAQs */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Webinar Speaker - FAQs</h3>
              <FaqAccordion faqs={[
                {
                  question: "Who are the speakers of WSA Webinars?",
                  answer: "Our webinars are led by industry experts and certified trainers with years of real-world experience in their respective fields."
                },
                {
                  question: "What benefits can I get by interacting with speakers?",
                  answer: "You can get your doubts clarified, receive career guidance, and gain insights into industry best practices directly from experts."
                },
                {
                  question: "How can I connect with webinar speakers post webinar?",
                  answer: "You can connect with speakers via our community channels or by reaching out through the contact details shared during the webinar."
                }
              ]} />
            </div>
            {/* Webinar Benefits - FAQs */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Webinar Benefits - FAQs</h3>
              <FaqAccordion faqs={[
                {
                  question: "When and how is the webinar quiz conducted?",
                  answer: "The quiz is conducted at the end of the webinar session. Details and instructions will be shared during the event."
                },
                {
                  question: "How can I get a webinar participation certificate?",
                  answer: "Attend the webinar and complete the quiz (if applicable). Certificates will be sent to your registered email after the event."
                },
                {
                  question: "What are WSA Goodies?",
                  answer: "WSA Goodies are exclusive rewards and gifts for active participants, such as e-books, discount coupons, and more."
                }
              ]} />
            </div>
            {/* Course Enrollment - FAQs */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Course Enrollment - FAQs</h3>
              <FaqAccordion faqs={[
                {
                  question: "How do I enroll for WSA’s Full Stack Course?",
                  answer: "You can enroll by visiting our website and following the enrollment process, or by contacting our support team for assistance."
                },
                {
                  question: "What is the effectiveness of WSA online courses?",
                  answer: "Our online courses are designed for hands-on learning, with live sessions, real projects, and continuous mentor support."
                },
                {
                  question: "Who are the mentors for WSA online courses?",
                  answer: "Mentors are experienced professionals and certified trainers who guide you throughout your learning journey."
                }
              ]} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AzureWebinarLanding;