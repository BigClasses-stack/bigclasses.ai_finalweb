import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig';
import { Loader2, TrendingUp, BarChart, Target, AlertCircle } from "lucide-react"; // Import relevant icons

interface SalaryInsights {
  min: string;
  avg: string;
  max: string;
}

interface OverviewData {
  avg_package: string;
  avg_hike: string;
  successful_transitions: string; // Assuming this is a number or string like "X+"
  salary_insights: SalaryInsights;
  manager_priority_percentage: string; // Assuming string like "X%"
}

const CourseOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!id) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    axiosInstance.get(`/courses/${id}/`)
      .then(res => {
        // Add validation for the overview structure
         if (res.data && res.data.overview && typeof res.data.overview === 'object') {
           setData(res.data.overview);
        } else {
          setError("Course overview data is missing or invalid.");
        }
      })
      .catch(err => {
        console.error('Failed to fetch course overview:', err);
        setError(err.response?.data?.message || "Failed to load course overview. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

   if (loading) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
             <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
             <p className="text-gray-600">Loading Course Overview...</p>
           </div>
         </section>
      );
   }

   if (error) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[300px] flex items-center justify-center">
         <div className="text-center bg-red-50 p-6 rounded-lg shadow-sm max-w-md mx-auto">
           <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
           <h2 className="text-lg font-semibold text-red-700 mb-1">Error Loading Overview</h2>
           <p className="text-red-600 text-sm">{error}</p>
         </div>
       </section>
     );
   }


   if (!data) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[300px] flex items-center justify-center">
         <p className="text-gray-500">No course overview data available.</p>
       </section>
     );
   }

  // Helper function to calculate bar height (example logic, adjust as needed)
   const calculateBarHeight = (value: string, maxValStr: string, minValStr: string) => {
    // Basic parsing, assuming format like "X LPA" or just "X"
    const parseValue = (str: string) => parseFloat(str.replace(/[^\d.]/g, '')) || 0;
    const num = parseValue(value);
    const maxVal = parseValue(maxValStr);
    const minVal = parseValue(minValStr);

    if (maxVal <= minVal) return 'h-16'; // Default height if range is invalid

    // Normalize value within the range [minVal, maxVal] to [0, 1] then scale
    const range = maxVal - minVal;
    const normalized = range > 0 ? (num - minVal) / range : 0.5; // Avoid division by zero
    const minHeight = 16; // 4 * 4 = h-4 tailwind
    const maxHeight = 112; // 28 * 4 = h-28 tailwind
    const height = Math.max(minHeight, Math.min(maxHeight, minHeight + normalized * (maxHeight - minHeight)));

    return `h-[${Math.round(height)}px]`; // Use arbitrary height
  };

  return (
     // Section styling: White background, significant vertical padding, horizontal padding
     <section id="overview" className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
       <div className="container mx-auto">
         {/* Optional: Add a section title */}
         <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 md:mb-16">
           Career Impact Overview
         </h2>

         {/* Grid for the three cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1: Package & Hike */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 text-center flex flex-col items-center justify-center">
               <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
               <h3 className="text-lg font-semibold text-gray-600 mb-1">Average Package</h3>
               <p className="text-4xl lg:text-5xl font-extrabold text-blue-700 mb-6">{data.avg_package}</p>

               <div className="mt-auto w-full"> {/* Push details to bottom */}
                 <p className="text-xl font-bold text-gray-800">{data.avg_hike} Average Hike</p>
                 <p className="text-sm text-gray-500 mt-1">{data.successful_transitions}+ Successful Transitions</p>
               </div>
             </div>

            {/* Card 2: Salary Insights */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 text-center flex flex-col">
               <BarChart className="h-12 w-12 text-green-600 mb-4 mx-auto" />
               <h3 className="text-xl font-bold text-gray-800 mb-6">Annual Salary Insights</h3>
               <div className="flex justify-around items-end space-x-4 flex-grow mt-4"> {/* Use flex-grow */}
                 {/* Min Salary Bar */}
                 <div className="flex flex-col items-center">
                    <div className={`bg-green-200 ${calculateBarHeight(data.salary_insights.min, data.salary_insights.max, data.salary_insights.min)} w-10 rounded-t-md transition-all duration-500 ease-out`}></div>
                    <p className="mt-3 text-xs font-medium text-gray-600">Min</p>
                    <p className="text-sm font-semibold text-gray-800">{data.salary_insights.min}</p>
                  </div>
                 {/* Avg Salary Bar */}
                 <div className="flex flex-col items-center">
                   <div className={`bg-green-500 ${calculateBarHeight(data.salary_insights.avg, data.salary_insights.max, data.salary_insights.min)} w-10 rounded-t-md transition-all duration-500 ease-out`}></div>
                   <p className="mt-3 text-xs font-medium text-gray-600">Average</p>
                   <p className="text-sm font-semibold text-gray-800">{data.salary_insights.avg}</p>
                 </div>
                 {/* Max Salary Bar */}
                 <div className="flex flex-col items-center">
                   <div className={`bg-green-300 ${calculateBarHeight(data.salary_insights.max, data.salary_insights.max, data.salary_insights.min)} w-10 rounded-t-md transition-all duration-500 ease-out`}></div>
                   <p className="mt-3 text-xs font-medium text-gray-600">Max</p>
                   <p className="text-sm font-semibold text-gray-800">{data.salary_insights.max}</p>
                 </div>
               </div>
             </div>


            {/* Card 3: Manager Priority */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 text-center flex flex-col items-center justify-center">
               <Target className="h-12 w-12 text-indigo-600 mb-4" />
               <h3 className="text-lg font-semibold text-gray-600 mb-1">Hiring Manager Priority</h3>
               <p className="text-4xl lg:text-5xl font-extrabold text-indigo-700 mb-6">{data.manager_priority_percentage}</p>
               <p className="text-base text-gray-600 mt-auto">of managers prioritize hiring candidates with skills from this course.</p>
             </div>

           </div>
         </div>
       </section>
   );
 };

 export default CourseOverview;