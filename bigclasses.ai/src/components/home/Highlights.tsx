import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig';
import { CheckCircle2, Star, Clock, Users, Loader2, AlertCircle, Download, Calendar } from "lucide-react";
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
  const [batchSchedules, setBatchSchedules] = useState<any[]>([]);
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
          setData(null);
        }
        // Fetch batch schedules from backend
        if (res.data && res.data.batch_schedules) {
          setBatchSchedules(res.data.batch_schedules);
        } else {
          setBatchSchedules([]);
        }
      })
      .catch(err => {
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
      <style>{`
        @keyframes vibrate {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-1px) translateY(-1px); }
          20% { transform: translateX(1px) translateY(1px); }
          30% { transform: translateX(-1px) translateY(1px); }
          40% { transform: translateX(1px) translateY(-1px); }
          50% { transform: translateX(-1px) translateY(-1px); }
          60% { transform: translateX(1px) translateY(1px); }
          70% { transform: translateX(-1px) translateY(1px); }
          80% { transform: translateX(1px) translateY(-1px); }
          90% { transform: translateX(-1px) translateY(-1px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 16px rgba(59, 130, 246, 0.18), 0 0 32px rgba(147, 51, 234, 0.08); }
          50% { box-shadow: 0 0 24px rgba(59, 130, 246, 0.22), 0 0 48px rgba(147, 51, 234, 0.12); }
        }
        .batch-card {
          animation: float 3s ease-in-out infinite;
          transition: transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s, z-index 0.25s;
          cursor: pointer;
        }
        .batch-card:nth-child(1) { animation-delay: 0s; }
        .batch-card:nth-child(2) { animation-delay: 0.5s; }
        .batch-card:nth-child(3) { animation-delay: 1s; }
        .batch-card:nth-child(4) { animation-delay: 1.5s; }
        .batch-card:focus,
        .batch-card:hover {
          transform: scale(1.08) translateY(-10px);
          z-index: 30;
          box-shadow: 0 12px 36px 0 rgba(59,130,246,0.18), 0 0 0 4px rgba(59,130,246,0.10);
          animation: vibrate 0.7s ease-in-out infinite, pulse-glow 2s ease-in-out infinite, float 3s ease-in-out infinite;
          outline: none;
        }
      `}</style>

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

      {/* Upcoming Batch Schedule Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Upcoming Batch Schedule
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Choose your preferred batch timing and start your learning journey with our expert-led sessions
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {batchSchedules.map((batch, index) => (
              <div
                key={batch.id}
                className={`batch-card relative backdrop-blur-sm border rounded-2xl shadow-lg transition-all duration-300 transform overflow-hidden group ${
                  index === 0 ? 'bg-gradient-to-br from-blue-100/80 to-indigo-100/80 border-blue-200/60' :
                  index === 1 ? 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border-emerald-200/60' :
                  index === 2 ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200/60' :
                  'bg-gradient-to-br from-yellow-100/80 to-red-100/80 border-yellow-200/60'
                }`}
                tabIndex={0}
                aria-pressed={false}
              >
                {/* Card Header */}
                <div className={`backdrop-blur-sm border-b p-6 ${
                  index === 0 ? 'bg-gradient-to-r from-blue-200/60 to-indigo-200/60 border-blue-300/50 text-blue-900' :
                  index === 1 ? 'bg-gradient-to-r from-emerald-200/60 to-teal-200/60 border-emerald-300/50 text-emerald-900' :
                  index === 2 ? 'bg-gradient-to-r from-purple-200/60 to-pink-200/60 border-purple-300/50 text-purple-900' :
                  'bg-gradient-to-r from-yellow-200/60 to-red-200/60 border-yellow-300/50 text-yellow-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className={`h-6 w-6 ${
                      index === 0 ? 'text-blue-700' :
                      index === 1 ? 'text-emerald-700' :
                      index === 2 ? 'text-purple-700' :
                      'text-yellow-700'
                    }`} />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{batch.date}</div>
                      <div className="text-sm opacity-80">{batch.day}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{batch.title}</h3>
                  <p className="text-sm opacity-80">{batch.subtitle}</p>
                </div>

                {/* Card Body */}
                <div className={`p-6 ${
                  index === 0 ? 'bg-blue-50/60' :
                  index === 1 ? 'bg-emerald-50/60' :
                  index === 2 ? 'bg-purple-50/60' :
                  'bg-yellow-50/60'
                } backdrop-blur-sm`}>
                  <div className="space-y-4 mb-6">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-blue-100/70 border-blue-200/50' :
                      index === 1 ? 'bg-emerald-100/70 border-emerald-200/50' :
                      index === 2 ? 'bg-purple-100/70 border-purple-200/50' :
                      'bg-yellow-100/70 border-yellow-200/50'
                    } backdrop-blur-sm`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          index === 0 ? 'bg-blue-200/80 border-blue-300/50' :
                          index === 1 ? 'bg-emerald-200/80 border-emerald-300/50' :
                          index === 2 ? 'bg-purple-200/80 border-purple-300/50' :
                          'bg-yellow-200/80 border-yellow-300/50'
                        } backdrop-blur-sm`}>
                          <Calendar className={`h-5 w-5 ${
                            index === 0 ? 'text-blue-700' :
                            index === 1 ? 'text-emerald-700' :
                            index === 2 ? 'text-purple-700' :
                            'text-yellow-700'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Start Date</p>
                          <p className="text-sm text-gray-600">{batch.day}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-blue-100/70 border-blue-200/50' :
                      index === 1 ? 'bg-emerald-100/70 border-emerald-200/50' :
                      index === 2 ? 'bg-purple-100/70 border-purple-200/50' :
                      'bg-yellow-100/70 border-yellow-200/50'
                    } backdrop-blur-sm`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          index === 0 ? 'bg-blue-200/80 border-blue-300/50' :
                          index === 1 ? 'bg-emerald-200/80 border-emerald-300/50' :
                          index === 2 ? 'bg-purple-200/80 border-purple-300/50' :
                          'bg-yellow-200/80 border-yellow-300/50'
                        } backdrop-blur-sm`}>
                          <Clock className={`h-5 w-5 ${
                            index === 0 ? 'text-blue-700' :
                            index === 1 ? 'text-emerald-700' :
                            index === 2 ? 'text-purple-700' :
                            'text-yellow-700'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{batch.time}</p>
                          <p className="text-sm text-gray-600">{batch.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full bg-gradient-to-r text-white border-0 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                      index === 0 ? 'from-blue-500/90 to-indigo-600/90 hover:from-blue-600/95 hover:to-indigo-700/95' :
                      index === 1 ? 'from-emerald-500/90 to-teal-600/90 hover:from-emerald-600/95 hover:to-teal-700/95' :
                      index === 2 ? 'from-purple-500/90 to-pink-600/90 hover:from-purple-600/95 hover:to-pink-700/95' :
                      'from-yellow-500/90 to-red-600/90 hover:from-yellow-600/95 hover:to-red-700/95'
                    }`}
                    onClick={() => navigate('/signup')}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Get Free Course Demo</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Button>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-12 translate-x-8 -translate-y-8 ${
                  index === 0 ? 'text-blue-400' :
                  index === 1 ? 'text-emerald-400' :
                  index === 2 ? 'text-purple-400' :
                  'text-yellow-400'
                }`}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="currentColor" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              Can't find a suitable time? We also offer flexible scheduling options.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-3 rounded-xl font-semibold"
              onClick={scrollToFooter}
            >
              Contact Us for Custom Schedule
            </Button>
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