import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig';
// Import necessary icons - CheckCircle2 is used for features list items
import { CheckCircle2, Star, Clock, Users, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button

// Define primary color for consistency
const PRIMARY_COLOR = "blue-600";
const PRIMARY_HOVER_COLOR = "blue-700";

// Define a basic type for the data structure you expect
interface HighlightsData {
  title?: string;
  key_topics?: string[];
  features?: string[];
  students_enrolled?: string | number;
  rating?: string | number;
  duration?: string;
  image_url?: string;
}

const Highlights: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Ensure type safety for id
  const navigate = useNavigate();
  const [data, setData] = useState<HighlightsData | null>(null); // Use the defined type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null); // Reset error on new fetch

    // Using generic `any` for the axios response type for simplicity,
    // but ideally you'd have a stricter type for the full response.
    axiosInstance.get<any>(`/courses/${id}/`)
      .then(res => {
        // Check for the expected nested data structure
        if (res.data && res.data.highlights) {
          setData(res.data.highlights as HighlightsData); // Cast to your defined type
        } else {
           console.warn("Fetched data but 'highlights' key is missing or empty.", res.data);
           // If highlights are missing, treat it as no data for this section
           setData(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch highlights:', err);
        setError(err.response?.data?.message || "Failed to load highlights data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [id]); // Dependency array includes id

  const scrollToFooter = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Conditional Rendering based on State ---

  if (loading) {
      return (
        <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className={`h-12 w-12 animate-spin text-${PRIMARY_COLOR} mx-auto mb-4`} />
            <p className="text-lg text-gray-600">Loading Course Highlights...</p>
          </div>
        </section>
      );
  }

  if (error) {
    return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
         <div className="text-center bg-red-50 p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Highlights</h2>
            <p className="text-red-600">{error}</p>
            {/* Optional: Add a retry button */}
           </div>
         </section>
      );
  }

  // Check if data is null or effectively empty after loading
   if (!data || (data.key_topics?.length === 0 && data.features?.length === 0 && !data.title)) {
     return (
       <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
         <div className="text-center">
           <h2 className="text-xl font-semibold text-gray-700">No Highlights Available</h2>
           <p className="text-gray-500 mt-2">Highlights for this course could not be found or are empty.</p>
         </div>
       </section>
     );
   }

  // --- Data is loaded, render content ---

  // Destructure data for cleaner access (add default values for safety)
    const {
      title = "Course Title Placeholder",
      key_topics = [], // Ensure these are arrays even if missing in API
      features = [],   // Ensure these are arrays even if missing in API
      students_enrolled = "0",
      rating = "N/A",
      duration = "N/A",
      image_url = "/placeholder-image.jpg" // Provide a default placeholder image path
    } = data;

  return (
    <section id="highlights" className="bg-white py-15 md:py-5 px-4 sm:px-6 lg:px-8">
       <div className="container mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text Content Column */}
        <div className="order-2 md:order-1">
          {/* Course Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>

          {/* Key Topics Section - Applying styling from TopicsAndFeatures */}
          {key_topics.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Topics You'll Cover:</h3>
              {/* Adjusted ul spacing and li items as per TopicsAndFeatures */}
              <ul className="space-y-1"> {/* Changed from space-y-2 */}
                {(key_topics as string[]).map((topic: string, idx: number) => (
                  // Adjusted li classes for alignment and spacing as per TopicsAndFeatures
                  <li key={`topic-${idx}`} className="flex items-center space-x-3"> {/* Changed from items-start mr-3 mt-1 */}
                    {/* Green Circle Icon from TopicsAndFeatures */}
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                    {/* Using text-gray-700 from original Highlights component, added text-base for consistency */}
                    <span className="text-gray-700 text-base">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section - Applying styling from TopicsAndFeatures */}
          {features.length > 0 && (
            <div className="mb-8">
              {/* Keeping heading commented out as it was in both snippets */}
              {/* <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Features:</h3> */}
              {/* Adjusted ul spacing and li items as per TopicsAndFeatures */}
              <ul className="space-y-1"> {/* Changed from space-y-2 */}
                {(features as string[]).map((feature: string, idx: number) => (
                  // Adjusted li classes for alignment and spacing as per TopicsAndFeatures
                  <li key={`feature-${idx}`} className="flex items-center space-x-3"> {/* Changed from items-start mr-3 mt-1 */}
                    {/* Blue Filled Check Circle Icon from TopicsAndFeatures */}
                    <CheckCircle2
                      className={`h-5 w-5 text-${PRIMARY_COLOR} flex-shrink-0`}
                    />
                     {/* Using text-gray-700 from original Highlights component, added text-base for consistency */}
                    <span className="text-gray-700 text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-4 items-center text-gray-600">
             <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="font-medium"><strong className="text-gray-800">{students_enrolled}+</strong> Students Enrolled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-medium"><strong className="text-gray-800">{rating}</strong> Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium"><strong className="text-gray-800">{duration}</strong> Duration</span>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg" // Larger button size
              className={`bg-${PRIMARY_COLOR} text-white hover:bg-${PRIMARY_HOVER_COLOR} rounded-lg px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg transition duration-300 w-full sm:w-auto`}
              onClick={() => navigate('/signup')}
            >
              Schedule Online Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} hover:bg-${PRIMARY_COLOR}/10 rounded-lg px-8 py-3 text-base font-semibold transition duration-300 w-full sm:w-auto`}
              onClick={scrollToFooter}
            >
              Contact Course Adviser
            </Button>
          </div>
        </div>

        {/* Image Column */}
        <div className="order-1 md:order-2">
          {/* Added rounded corners and shadow from TopicsAndFeatures styling */}
          <img
             src={image_url}
             alt={`${title} course visual`}
             width={600} // Original width for aspect ratio hint
             height={608} // Original height for aspect ratio hint
             className="w-full h-auto object-cover "
             loading="lazy" // Keep lazy loading
           />
         </div>
       </div>
     </section>
   );
 };

 export default Highlights;