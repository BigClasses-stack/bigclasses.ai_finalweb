import React from "react";
import { CheckCircle, Briefcase, BookOpenCheck, GraduationCap } from "lucide-react";

const PRIMARY_COLOR = "blue-600";

const ListItem = ({ text }: { text: string }) => (
  <li className="flex items-start space-x-3">
    <CheckCircle className={`text-${PRIMARY_COLOR} w-5 h-5 mt-0.5 flex-shrink-0`} />
    <span className="text-gray-700 text-base">{text}</span>
  </li>
);

const PlacementAssistance = () => {
  return (
    <section id="placement-assistance" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 md:mb-16">
          Career & Placement Assistance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Card 1 */}
          <div className="bg-gradient-to-br from-blue-50/50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col">
            <div className="flex items-center mb-6">
              <Briefcase className={`h-8 w-8 text-${PRIMARY_COLOR} mr-3`} />
              <h3 className="text-2xl font-semibold text-gray-800">Comprehensive Job Assistance</h3>
            </div>
            <ul className="space-y-4 mb-4 flex-grow">
              <ListItem text="Mastering the course curriculum and projects" />
              <ListItem text="Hackathons & Mock Interviews with Industry Experts" />
              <ListItem text="Regular Quizzes and Assignments for skill assessment" />
              <ListItem text="Portfolio Building guidance with SME Assistance" />
              <ListItem text="Professional Resume Review and Optimization" />
              <ListItem text="Interview Preparation Sessions" />
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-br from-blue-50/50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col">
            <div className="flex items-center mb-6">
              <GraduationCap className={`h-8 w-8 text-${PRIMARY_COLOR} mr-3`} />
              <h3 className="text-2xl font-semibold text-gray-800">Job Support Program</h3>
            </div>
            <ul className="space-y-4 mb-4 flex-grow">
              <ListItem text="Leverage our network facilitating thousands of career transitions globally." />
              <ListItem text="Access expert job support from our world-class trainers (available hourly, weekly, or monthly)." />
              <ListItem text="Get assistance with on-the-job challenges and tasks." />
              <ListItem text="Boost confidence through personalized coaching." />
              <ListItem text="Build long-term industry readiness with our mentors." />
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-blue-50/50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col">
            <div className="flex items-center mb-6">
              <BookOpenCheck className={`h-8 w-8 text-${PRIMARY_COLOR} mr-3`} />
              <h3 className="text-2xl font-semibold text-gray-800">BigClass LMS</h3>
            </div>
            <ul className="space-y-4 mb-4 flex-grow">
              <ListItem text="Watch video lessons with summaries and key points" />
              <ListItem text="Take quizzes to test your knowledge" />
              <ListItem text="Submit assignments and receive feedback" />
              <ListItem text="Stay updated with real-time notifications" />
              <ListItem text="Manage your daily learning schedule" />
              <ListItem text="Toggle dark mode for comfortable viewing" />
              <ListItem text="Automated resume creation" />
              <ListItem text="24/7 chat support for every video" />


            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlacementAssistance;
