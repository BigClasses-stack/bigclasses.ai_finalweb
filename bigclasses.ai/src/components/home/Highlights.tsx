import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig';
import { CheckCircle2, Star, Clock, Users, Loader2, AlertCircle, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const PRIMARY_COLOR = "blue-600";
const PRIMARY_HOVER_COLOR = "blue-700";

interface HighlightsData {
  title?: string;
  key_topics?: string[];
  features?: string[];
  students_enrolled?: string | number;
  rating?: string | number;
  duration?: string;
  image_url?: string;
}

interface EnrollmentFormData {
  name: string;
  email: string;
  phone: string;
  extra_info: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const Highlights: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<HighlightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EnrollmentFormData>({
    name: '',
    email: '',
    phone: '',
    extra_info: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone || formData.phone.trim().length < 10) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof EnrollmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      extra_info: ''
    });
    setFormErrors({});
  };

  useEffect(() => {
    if (!id) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    axiosInstance.get<any>(`/courses/${id}/`)
      .then(res => {
        if (res.data && res.data.highlights) {
          setData(res.data.highlights as HighlightsData);
        } else {
          console.warn("Fetched data but 'highlights' key is missing or empty.", res.data);
          setData(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch highlights:', err);
        setError(err.response?.data?.message || "Failed to load highlights data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const scrollToFooter = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownloadClick = () => {
    setIsModalOpen(true);
    setShowSuccessMessage(false);
    setEnrollmentSuccess(false);
    resetForm();
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/courses/${id}/enroll-download/`, formData);
      
      if (response.data.success) {
        setEnrollmentSuccess(true);
        setShowSuccessMessage(true);
        
        toast({
          title: "Enrollment Successful!",
          description: "Thank you for enrolling. Your download will begin shortly.",
        });
        
        // Auto-download after 2 seconds
        setTimeout(() => {
          downloadCurriculum();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCurriculum = async () => {
    if (!id) return;

    setDownloadLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/${id}/download-curriculum/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'curriculum.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Close modal after successful download
      setTimeout(() => {
        setIsModalOpen(false);
        setShowSuccessMessage(false);
        setEnrollmentSuccess(false);
      }, 1000);
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download curriculum. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setShowSuccessMessage(false);
      setEnrollmentSuccess(false);
      resetForm();
    }
  };

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
        </div>
      </section>
    );
  }

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

  const {
    title = "Course Title Placeholder",
    key_topics = [],
    features = [],
    students_enrolled = "0",
    rating = "N/A",
    duration = "N/A",
    image_url = "/placeholder-image.jpg"
  } = data;

  return (
    <>
      <section id="highlights" className="bg-white py-15 md:py-5 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content Column */}
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>

            {/* Key Topics Section */}
            {key_topics.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Topics You'll Cover:</h3>
                <ul className="space-y-1">
                  {key_topics.map((topic: string, idx: number) => (
                    <li key={`topic-${idx}`} className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 text-base">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Features Section */}
            {features.length > 0 && (
              <div className="mb-8">
                <ul className="space-y-1">
                  {features.map((feature: string, idx: number) => (
                    <li key={`feature-${idx}`} className="flex items-center space-x-3">
                      <CheckCircle2
                        className={`h-5 w-5 text-${PRIMARY_COLOR} flex-shrink-0`}
                      />
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
                size="lg"
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
              <button
                onClick={handleDownloadClick}
                disabled={downloadLoading}
                className={`inline-flex items-center justify-center border-${PRIMARY_COLOR} text-black hover:bg-${PRIMARY_COLOR}/10 disabled:border-gray-400 disabled:text-gray-400 rounded-lg px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg transition duration-300 w-full sm:w-auto whitespace-nowrap border`}
              >
                <Download className="h-5 w-5 mr-2" />
                Download Curriculum
              </button>
            </div>
          </div>

          {/* Image Column */}
          <div className="order-1 md:order-2">
            <img
              src={image_url}
              alt={`${title} course visual`}
              width={600}
              height={608}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              {showSuccessMessage ? "Enrollment Successful!" : "Download Curriculum"}
            </DialogTitle>
          </DialogHeader>
          
          {showSuccessMessage ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thank you for enrolling!
              </h3>
              <p className="text-gray-600 mb-6">
                Your curriculum download will begin shortly...
              </p>
              {downloadLoading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span>Preparing download...</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="mt-1"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="extra_info">Additional Information (Optional)</Label>
                <Textarea
                  id="extra_info"
                  value={formData.extra_info}
                  onChange={(e) => handleInputChange('extra_info', e.target.value)}
                  placeholder="Any questions or additional information..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-${PRIMARY_COLOR} hover:bg-${PRIMARY_HOVER_COLOR}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll & Download"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Highlights;
