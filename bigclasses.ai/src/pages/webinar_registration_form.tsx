import React, { useState } from 'react';
import { Loader2, Shield, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface WebinarRegistrationFormProps {
  onSuccess?: () => void;
}

const WebinarRegistrationForm: React.FC<WebinarRegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { fullName, email, phone } = formData;
    
    if (!fullName.trim()) {
      setSubmitMessage('Please enter your full name');
      setMessageType('error');
      return false;
    }
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitMessage('Please enter a valid email address');
      setMessageType('error');
      return false;
    }
    
    if (!phone.trim() || phone.length < 10) {
      setSubmitMessage('Please enter a valid phone number');
      setMessageType('error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Processing your registration...');
    setMessageType('');

    try {
      // Enhanced payload with additional metadata
      const registrationData = {
        ...formData,
        timestamp: new Date().toISOString(),
        webinar: 'Data Engineering Career Masterclass',
        dates: '12th & 13th July 2025',
        time: '6 PM - 8 PM IST',
        registrationId: `REG-${Date.now()}`,
        source: 'webinar-form'
      };

      // Google Apps Script URL for data storage and email sending
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVE123GWcT0MLC-e_b-WmPIckA5MHaifnRp6HTEgNw_We1rMy4mcjJFUg67_NWBbpu2g/exec';
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitMessage('🎉 Registration successful! Welcome emails have been sent to you and our team.');
      setMessageType('success');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        education: '',
        experience: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }

    } catch (error) {
      console.error('Registration error:', error);
      setSubmitMessage('Registration failed. Please try again or contact our support team.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans max-w-4xl mx-auto">
      <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
            Webinar Registration
          </h2>
          <p className="text-gray-600 text-lg">
            Data Engineering Career Masterclass
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-700">
            <span className="bg-blue-100 px-3 py-1 rounded-full">📅 July 12-13, 2025</span>
            <span className="bg-green-100 px-3 py-1 rounded-full">🕕 6-8 PM IST</span>
          </div>
        </div>

        {/* Status Message */}
        {submitMessage && (
          <div className={`p-4 rounded-xl text-center font-medium border-2 ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : messageType === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {messageType === 'success' && <CheckCircle size={20} />}
              {messageType === 'error' && <AlertCircle size={20} />}
              {!messageType && <Mail size={20} />}
              {submitMessage}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300 hover:border-gray-300"
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300 hover:border-gray-300"
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Phone and Education Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300 hover:border-gray-300"
                placeholder="+91 12345 67890"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Educational Background
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300 hover:border-gray-300"
                disabled={isSubmitting}
              >
                <option value="">Select your education</option>
                <option value="BTech/BE">BTech/BE - Engineering</option>
                <option value="MCA">MCA - Computer Applications</option>
                <option value="BSc">BSc - Science</option>
                <option value="MSc">MSc - Science</option>
                <option value="MBA">MBA - Management</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Experience Row */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Current Role/Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all duration-300 hover:border-gray-300"
              disabled={isSubmitting}
            >
              <option value="">Select your current status</option>
              <option value="Student">Student</option>
              <option value="Fresher">Fresher (0 experience)</option>
              <option value="0-2 years">Working Professional (0-2 years)</option>
              <option value="2-5 years">Working Professional (2-5 years)</option>
              <option value="5+ years">Working Professional (5+ years)</option>
              <option value="Career Switch">Looking for Career Switch</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Processing Registration...
            </>
          ) : (
            <>
              🚀 Register for Free Webinar
              <Shield size={24} />
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>
            🔒 Your data is secure. We'll send you webinar details and updates.
            <br />
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebinarRegistrationForm;