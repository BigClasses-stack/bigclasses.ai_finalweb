import React, { useState } from 'react';
import { Loader2, Shield, Lock } from 'lucide-react';

interface GenerativeAIRegistrationFormProps {
  onSuccess?: () => void;
}

const GenerativeAIRegistrationForm: React.FC<GenerativeAIRegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('');

    // Check if all fields are filled
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.education.trim() ||
      !formData.experience.trim()
    ) {
      setSubmitMessage('❌ Please fill in all the details before submitting.');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const SCRIPT_URL ='https://script.google.com/macros/s/AKfycbxJrAvf8vgnc7AiRuNDzXt4wyeqShtkVmJZxpj7DLcrQJJTvgYfuNyjGwjFACPYKNX8/exec';
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          webinar: 'Generative AI Career Masterclass',
          dates: '12th & 13th July 2025',
          time: '4 PM - 5 PM IST'
        })
      });

      setTimeout(() => {
        setSubmitMessage('🎉 Registration successful! Check your email for confirmation and meeting details.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          education: '',
          experience: ''
        });
        setIsSubmitting(false);
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      setSubmitMessage('❌ Registration failed. Please try again or contact support.');
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Webinar Registration</h2>
        {submitMessage && (
          <div className={`p-3 sm:p-4 rounded-xl text-center font-medium ${
            submitMessage.includes('successful') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {submitMessage}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300"
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300"
              placeholder="Enter your phone number"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Educational Background</label>
            <select
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            >
              <option value="">Select your education</option>
              <option value="BTech/BE">BTech/BE</option>
              <option value="MCA">MCA</option>
              <option value="BSc">BSc</option>
              <option value="MSc">MSc</option>
              <option value="MBA">MBA</option>
              <option value="BCA">BCA</option>
              <option value="Diploma">Diploma</option>
              <option value="12th Pass">12th Pass</option>
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
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300"
            disabled={isSubmitting}
          >
            <option value="">Select your current status</option>
            <option value="Student">Student</option>
            <option value="Fresher">Fresher</option>
            <option value="0-2 years">Working Professional (0-2 years)</option>
            <option value="2-5 years">Working Professional (2-5 years)</option>
            <option value="5+ years">Working Professional (5+ years)</option>
            <option value="Career Switch">Looking for Career Switch</option>
            <option value="Entrepreneur">Entrepreneur</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 rounded-xl text-xl font-semibold shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <Lock size={20} className="inline" />
              Register for Free Webinar
              <Shield size={20} className="inline" />
            </>
          )}
        </button>
        <div className="text-center text-sm text-gray-500">
          <p>🔒 Your data is secure and will only be used for webinar communication.</p>
        </div>
      </form>
    </div>
  );
};

export default GenerativeAIRegistrationForm;