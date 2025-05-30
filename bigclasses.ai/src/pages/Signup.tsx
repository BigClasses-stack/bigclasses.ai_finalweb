import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { courses } from "../components/home/CoursesSection";
const Enroll = () => {
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    course_title: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCourseChange = (value: string) => {
    setFormData(prev => ({ ...prev, course_title: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.student_name || !formData.email || !formData.course_title || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      const response = await axios.post("https://www.bigclasses.ai/api/enroll/", formData);
      setSuccess("Enrollment successful!");
      setFormData({ student_name: "", email: "", course_title: "", phone: "" }); 
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Enrollment failed. Please try again.");
      } else {
        setError("Server error. Please try again later.");
      }
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Enroll Now</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="student_name">Full Name *</Label>
            <Input
              id="student_name"
              name="student_name"
              type="text"
              placeholder="John Doe"
              value={formData.student_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="course_title">Course Title *</Label>
            <Select 
              required 
              value={formData.course_title}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger>
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
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="123-456-7890"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-full bg-blue-500 text-white hover:bg-blue-600">
            Enroll Now
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
      </div>
    </div>
  );
};
export default Enroll;
