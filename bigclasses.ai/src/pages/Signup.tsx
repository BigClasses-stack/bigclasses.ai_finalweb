import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courses = [
  { id: 1, title: "Machine Learning Fundamentals" },
  { id: 2, title: "Deep Learning & Neural Networks" },
  { id: 3, title: "Natural Language Processing" },
  { id: 4, title: "Computer Vision" },
  { id: 5, title: "AI Ethics & Governance" },
  { id: 6, title: "Reinforcement Learning" },
  { id: 7, title: "MLOps & Production AI" },
];

const Enroll = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] w-[1100px] overflow-hidden">
        <div className="flex min-h-[550px]">
          {/* Left Side - Form Section */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Left-aligned Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
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
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
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
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
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
                    <SelectTrigger className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex items-center pt-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>

                <Button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg mt-4"
                >
                  ENROLL NOW
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center text-xs">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <p className="mt-4 text-green-600 text-center text-base font-medium">
                  {success}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Full Image */}
          <div className="flex-1 hidden md:block">
            <img
              src="/images/enroll_now.webp"
              alt="Enroll Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enroll;