import React, { useEffect } from 'react';
import { useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import EnrollPage from "./pages/EnrollPage";
import CourseDetails from "@/pages/CourseDetails";
import FeatureDetail from "./components/home/FeatureDetail";
import FeatureOverview from "./components/home/FeatureOverview";


import Blog from "./pages/blogs/blog";
import Datascienceblog from "./pages/blogs/pythonclass";
import Pythonclass from "./pages/blogs/pythonclass";
import PythonClassBlogPage from './pages/blogs/pythonclass';
import BlogPage from './pages/blogs/blog';


const queryClient = new QueryClient();

// Analytics utility functions
const initializeAnalytics = () => {
  const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-YPMCYX1YXX';
  const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-5VQ6XHZ8';

  // Initialize dataLayer for GTM
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // Initialize GA4
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);

  // Load GA4 script
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(gaScript);

  // Load GTM script
  const gtmScript = document.createElement('script');
  gtmScript.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(gtmScript);

  // Add GTM noscript fallback
  const noscriptFrame = document.createElement('noscript');
  noscriptFrame.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscriptFrame, document.body.firstChild);
};

const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID || 'G-YPMCYX1YXX', {
      page_path: path,
    });
  }
};

// Component to handle route tracking
const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const AppContent: React.FC = () => {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/enrollnow" element={<EnrollPage />} />
        <Route path="/:id" element={<CourseDetails />} /> 
        <Route path="*" element={<NotFound />} />
        <Route path="/feature-details/:id" element={<FeatureDetail />} /> 
        <Route path="/features" element={<FeatureOverview />} />
        <Route path="/features/:featureId" element={<FeatureOverview />} />

         {/* Add more blog routes as needed */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/datascience" element={<Datascienceblog />} />
        <Route path="/blog/pythonclass" element={<Pythonclass />} />
        <Route path="/blogs/pythonclass" element={<PythonClassBlogPage />} />
        <Route path="/blogs" element={<BlogPage />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

// Type declarations for window object
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}