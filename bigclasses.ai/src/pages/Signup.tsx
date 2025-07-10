import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react"; // Add this import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courses = [
  { id: 1, title: "Data Analytics" },
  { id: 2, title: "Python Programming" },
  { id: 3, title: "Machine Learning" },
  { id: 4, title: "Deep Learning" },
  { id: 5, title: "Natural Language Processing (NLP)" },
  { id: 6, title: "Generative AI" },
  { id: 7, title: "Langchain" },
  { id: 8, title: "LangGraph" },
  { id: 9, title: "MLOps" },
  { id: 10, title: "LLMOps" },
  { id: 11, title: "Agents" },
  { id: 12, title: "Ethics AI and Scaling AI system" },
];

const Enroll = () => {
  const navigate = useNavigate(); // Add this
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    course_title: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseChange = (value) => {
    setFormData((prev) => ({ ...prev, course_title: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.student_name ||
      !formData.email ||
      !formData.course_title ||
      !formData.phone
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Enrollment successful! Welcome to your AI journey!");
      setFormData({
        student_name: "",
        email: "",
        course_title: "",
        phone: "",
      });
    } catch (err) {
      setError("Enrollment failed. Please try again.");
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-[0_20px_50px_rgba(0,_0,_0,_0.1)] w-full max-w-6xl overflow-hidden rounded-lg my-8 relative">
        {/* Add Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>

        {/* Mobile Image Section - Shows at top on mobile */}
        <div className="block md:hidden">
          <div className="h-56">
            <img
              src="/images/enroll_now.webp"
              alt="Students learning together"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:min-h-[550px]">
          {/* Left Side - Form Section */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Enroll Now
                  <div className="w-12 h-0.5 bg-purple-600 mt-1"></div>
                </h1>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="student_name"
                    className="text-gray-700 font-medium mb-1 block text-sm"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="student_name"
                    name="student_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.student_name}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-medium mb-1 block text-sm"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="course_title"
                    className="text-gray-700 font-medium mb-1 block text-sm"
                  >
                    Course
                  </Label>
                  <Select
                    required
                    value={formData.course_title}
                    onValueChange={handleCourseChange}
                  >
                    <SelectTrigger className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      align="start"
                      className="max-h-60 z-50"
                    >
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.title}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-gray-700 font-medium mb-1 block text-sm"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center pt-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>

                <Button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg mt-4 transition-colors duration-200"
                >
                  ENROLL NOW
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-center text-sm font-medium">
                    {success}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Desktop Image Section */}
          <div className="flex-1 hidden md:block">
            <img
              src="/images/enroll_now.webp"
              alt="Students learning together"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enroll;