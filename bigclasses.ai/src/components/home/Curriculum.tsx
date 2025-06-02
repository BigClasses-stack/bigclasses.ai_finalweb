import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig';
import { CheckCircle, ChevronDown, ChevronUp, Loader2, AlertCircle, BookOpen } from "lucide-react";

interface Topic {
  title: string;
  // Add other topic properties if needed, e.g., duration, type (video, reading)
}

interface Module {
  title: string;
  description: string;
  topics: Topic[];
}

const Curriculum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0); // Open first module by default? Or null
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({}); // Persistence needed for real use

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
        // Validate the curriculum structure
        if (res.data && Array.isArray(res.data.curriculum)) {
          setModules(res.data.curriculum);
           // Optionally open the first module if curriculum exists
           if (res.data.curriculum.length > 0) {
              // setOpenModuleIndex(0); // Uncomment to open first module by default
           }
        } else {
          setError("No valid curriculum data found for this course.");
           setModules([]); // Ensure modules is an empty array
        }
      })
      .catch(err => {
        console.error('Failed to fetch curriculum:', err);
        setError(err.response?.data?.message || "Failed to load curriculum. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const toggleModule = (index: number) => {
    setOpenModuleIndex(prevIndex => (prevIndex === index ? null : index));
  };

  // Note: This state is temporary. For persistence, you'd need to save this to localStorage or backend.
  const toggleTopicCompletion = (topicTitle: string) => {
    setCompletedTopics(prev => ({ ...prev, [topicTitle]: !prev[topicTitle] }));
  };

   if (loading) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
         <div className="text-center">
           <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
           <p className="text-gray-600">Loading Curriculum...</p>
         </div>
       </section>
     );
   }

   if (error) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
         <div className="text-center bg-red-50 p-6 rounded-lg shadow-sm max-w-md mx-auto">
           <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
           <h2 className="text-lg font-semibold text-red-700 mb-1">Error Loading Curriculum</h2>
           <p className="text-red-600 text-sm">{error}</p>
         </div>
       </section>
     );
   }

  return (
     <section id="curriculum" className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
       <div className="container mx-auto max-w-4xl"> {/* Constrain width for readability */}
         <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
           Course Curriculum
         </h2>
         <p className="text-lg text-center text-gray-600 mb-12 md:mb-16">
           Explore the detailed modules and topics covered in this course.
         </p>

          {modules.length === 0 ? (
             <div className="text-center py-16">
               <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
               <p className="text-lg text-gray-500">The curriculum for this course is not yet available.</p>
               <p className="text-sm text-gray-400 mt-2">Please check back later or contact support.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {modules.map((module, idx) => {
                 const isOpen = openModuleIndex === idx;
                 return (
                   <div key={`module-${idx}`} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white transition-shadow hover:shadow-md">
                      {/* Module Header - Clickable Area */}
                      <button
                       onClick={() => toggleModule(idx)}
                       className="w-full flex justify-between items-center p-5 md:p-6 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                       aria-expanded={isOpen}
                       aria-controls={`module-content-${idx}`}
                     >
                       <div className="flex-grow pr-4">
                         <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1 block">Module {idx + 1}</span>
                         <h3 className="text-lg md:text-xl font-semibold text-gray-800">{module.title}</h3>
                          {/* Optional: Show description only when closed? Or keep it always visible */}
                          {!isOpen && <p className="text-sm text-gray-500 mt-1 truncate">{module.description}</p>}
                        </div>
                       {isOpen ? <ChevronUp size={24} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={24} className="text-gray-500 flex-shrink-0" />}
                     </button>

                     {/* Module Content - Expandable Area */}
                     <div
                       id={`module-content-${idx}`}
                       className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`} // Adjust max-height if needed
                     >
                       <div className="px-5 md:px-6 pb-6 pt-4 border-t border-gray-200">
                         <p className="text-sm text-gray-600 mb-5">{module.description}</p>
                         {(!module.topics || module.topics.length === 0) ? (
                           <p className="text-sm text-gray-500 italic">No specific topics listed for this module.</p>
                         ) : (
                           <ul className="space-y-3">
                             {module.topics.map((topic, tidx) => (
                               <li key={`topic-${idx}-${tidx}`} className="flex items-center space-x-3 group">
                                 <button
                                   onClick={() => toggleTopicCompletion(topic.title)}
                                   className={`flex-shrink-0 focus:outline-none rounded-full p-0.5 ${completedTopics[topic.title] ? 'bg-green-100' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                                   title={completedTopics[topic.title] ? "Mark as incomplete" : "Mark as complete"}
                                 >
                                   <CheckCircle
                                     size={20}
                                     className={`transition-colors ${completedTopics[topic.title] ? "text-green-500" : "text-gray-400 group-hover:text-gray-600"}`}
                                   />
                                 </button>
                                  <span className={`text-base text-gray-700 ${completedTopics[topic.title] ? 'line-through text-gray-500' : ''}`}>
                                   {topic.title}
                                 </span>
                                 {/* Optional: Add icons for topic type (video, reading) or duration */}
                               </li>
                             ))}
                           </ul>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
         </div>
       </section>
   );
 };

 export default Curriculum;