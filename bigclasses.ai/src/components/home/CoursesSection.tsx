import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Star,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const courses = [
  {
    id: 1,
    title: "Python Programming",
    description: "Learn the core concepts and algorithms behind machine learning with hands-on projects.",
    image: "https://math.duke.edu/sites/math.duke.edu/files/styles/large/public/images/Featured%20Courses%20MTH%20260%20Python%20Programming%20in%20Math%20image.jpg.png?itok=kTIwZdBL",
    students: "2,345",
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.9,
    modules: 12,
  },
  {
    id: 2,
    title: "Machine Learning",
    description: "Build solid foundations in machine learning with practical use cases and algorithms.",
    image: "https://media.istockphoto.com/id/1387900612/photo/automation-data-analytic-with-robot-and-digital-visualization-for-big-data-scientist.jpg?s=612x612&w=0&k=20&c=50maOJU6CpVC55mYnUqtff2aiaJZ7KlmMn4jNhWD_eo=",
    students: "3,100",
    duration: "10 weeks",
    level: "Intermediate",
    rating: 4.8,
    modules: 14,
  },
  {
    id: 3,
    title: "Deep Learning",
    description: "Explore neural networks, CNNs, RNNs, and advanced architectures like Transformers.",
    image: "https://miro.medium.com/v2/resize:fit:1024/1*tWLecb8_qosGJNHFAF43qA.jpeg",
    students: "2,850",
    duration: "9 weeks",
    level: "Intermediate",
    rating: 4.7,
    modules: 13,
  },
  {
    id: 4,
    title: "Natural Language Processing",
    description: "Understand natural language processing from tokenization to transformers.",
    image: "https://media.istockphoto.com/id/1420753803/photo/ai-and-nlp-natural-language-processing-cognitive-computing-technology-concept.jpg?s=612x612&w=0&k=20&c=sNQoIU4pZRg4kLcu8OkKO9yXPZiZIr0ZwkKCoYSaB5I=",
    students: "1,950",
    duration: "7 weeks",
    level: "Intermediate",
    rating: 4.6,
    modules: 11,
  },
  {
    id: 5,
    title: "Generative AI",
    description: "Learn how to build and evaluate generative models like GANs and VAEs.",
    image: "https://prescienceds.com/wp-content/uploads/2024/10/GenAI.webp",
    students: "2,200",
    duration: "8 weeks",
    level: "Advanced",
    rating: 4.8,
    modules: 12,
  },
  {
    id: 6,
    title: "LangChain",
    description: "Master building LLM applications with LangChain and real-world integrations.",
    image: "/lovable-uploads/langchain.png", // Updated image path
    students: "1,600",
    duration: "6 weeks",
    level: "Intermediate",
    rating: 4.7,
    modules: 10,
  },
  {
    id: 7,
    title: "LangGraph",
    description: "Create powerful AI workflows with LangGraph’s graph-based programming paradigm.",
    image: "https://cdn.prod.website-files.com/6583e2b6af21ee3aa85c3013/671f853754d6970c274a7136_66824dd409fe46033e194223_lang%2520Graph.png",
    students: "1,350",
    duration: "5 weeks",
    level: "Intermediate",
    rating: 4.6,
    modules: 9,
  },
  {
    id: 8,
    title: "MLOps",
    description: "Implement ML systems at scale with CI/CD, monitoring, and deployment strategies.",
    image: "https://www.marktechpost.com/wp-content/uploads/2022/08/Blog-Banner-2.png",
    students: "2,100",
    duration: "7 weeks",
    level: "Advanced",
    rating: 4.8,
    modules: 11,
  },
  {
    id: 9,
    title: "LLMOps",
    description: "Deploy, fine-tune, and scale large language models efficiently in production.",
    image: "https://markovate.com/wp-content/uploads/2024/05/LLMOps_-Streamlining-AI-Workflows-for-Optimal-Results-1280x960.webp",
    students: "1,800",
    duration: "6 weeks",
    level: "Advanced",
    rating: 4.7,
    modules: 10,
  },
  {
    id: 10,
    title: "Agents",
    description: "Build autonomous AI agents capable of decision-making and task execution.",
    image: "https://i0.wp.com/www.lyzr.ai/wp-content/uploads/2024/08/Understanding-AI-agents-scaled.webp",
    students: "1,500",
    duration: "6 weeks",
    level: "Intermediate",
    rating: 4.6,
    modules: 9,
  },
  {
    id: 11,
    title: "Ethics in AI and Scaling AI systems",
    description: "Explore ethical AI practices and the challenges in scaling responsible AI systems.",
    image: "https://innovationatwork.ieee.org/wp-content/uploads/2020/10/bigstock-Teamwork-Business-Team-Repair-300147874_1024X684.png",
    students: "1,700",
    duration: "5 weeks",
    level: "Beginner",
    rating: 4.8,
    modules: 8,
  }
];


const CoursesSection = () => {
  const navigate = useNavigate(); // Add this line to define navigate
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const handleViewCourse = (courseId: number) => {
    navigate(`/course-details/${courseId}`);
    // Remove the scroll behavior from here as we'll handle it in CourseDetails
  };

  const visibleCourses = showAllCourses ? courses : courses.slice(0, 8);

  return (
    <section id="courses" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="mb-4">
              Featured <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Explore our most popular AI and data science courses, designed to
              help you master the skills that matter.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleCourses.map((course) => (
            <Card
              key={course.id}
              className={`overflow-hidden border border-gray-200 transition-all duration-500 flex flex-col h-full transform ${
                hoveredId === course.id ? "shadow-2xl scale-105" : "shadow-md"
              }`}
              onMouseEnter={() => setHoveredId(course.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative h-52 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 transition-opacity duration-300 ${
                    hoveredId === course.id ? "opacity-100" : ""
                  }`}
                ></div>
                <img
                  src={course.image}
                  alt={course.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredId === course.id ? "scale-110" : ""
                  }`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 p-4 z-20 transform transition-transform duration-300 ${
                    hoveredId === course.id
                      ? "translate-y-0"
                      : "translate-y-full"
                  }`}
                >
            <Button
              className="w-full rounded-md"
              size="sm"
              onClick={() => handleViewCourse(course.id)}
            >
              View Course
            </Button>
                </div>
              </div>

              <CardContent className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        course.level === "Beginner"
                          ? "bg-green-100 text-green-800"
                          : course.level === "Intermediate"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {course.level}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium ml-1">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-[length:0%_2px] hover:bg-[length:100%_2px] bg-no-repeat bg-bottom transition-all duration-500">
                      {course.title}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.students} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-primary">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{course.modules} modules</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toggle Button */}
        <div className="mt-12 flex justify-center">
          {!showAllCourses && (
            <Button
              className="border border-black text-black font-semibold shadow-md rounded-lg px-6 py-2 transition-all duration-300 bg-white hover:bg-blue-600 hover:text-white hover:border-transparent flex items-center justify-center gap-2"
              onClick={() => setShowAllCourses(true)}
            >
              View All Courses
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
