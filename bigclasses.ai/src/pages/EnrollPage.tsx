// EnrollPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
const EnrollPage = () => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted successfully!");
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl relative animate-fadeIn">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors" 
          onClick={handleClose}
        >
          <X className="h-6 w-6" />
        </button>
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Get Skilled Today</h2>
          <p className="text-gray-600 mt-2">Fill the form below to start your learning journey</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Name<span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" 
              required 
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Phone<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value="+91" 
                readOnly 
                className="w-16 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-center" 
              />
              <input 
                type="tel" 
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" 
                required 
                placeholder="Your phone number"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email<span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" 
              required 
              placeholder="your.email@example.com"
            />
          </div>
          <button 
            type="submit" 
            className="bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl shadow-primary/30 mt-2"
          >
            SUBMIT
          </button>
          <p className="text-center text-xs text-gray-500 mt-4">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};
export default EnrollPage;