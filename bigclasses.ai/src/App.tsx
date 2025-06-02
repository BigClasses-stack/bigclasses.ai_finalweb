import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import EnrollPage from "./pages/EnrollPage";
import CourseDetails from "@/pages/CourseDetails";
import FeatureDetail from "./components/home/FeatureDetail";
import FeatureOverview from "./components/home/FeatureOverview";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/enrollnow" element={<EnrollPage />} />
          <Route path="/course-details/:id" element={<CourseDetails />} /> 
          <Route path="*" element={<NotFound />} />
          <Route path="/feature-details/:id" element={<FeatureDetail />} /> 
          <Route path="/features" element={<FeatureOverview />} />
          <Route path="/features/:featureId" element={<FeatureOverview />} />
         </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;