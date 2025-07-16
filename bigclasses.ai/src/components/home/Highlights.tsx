import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '@/lib/axiosConfig'; // Ensure this correctly points to your axios setup
import { CheckCircle2, Star, Clock, Users, Loader2, AlertCircle, Download, Calendar, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Define your Django API Base URL
// IMPORTANT: Adjust this if your Django server runs on a different port or domain in production!
// This might not be needed if axiosInstance already has the base URL configured properly.
// Keeping it for clarity, but if axiosInstance handles it, this can be removed.
const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://localhost:8000';

interface HighlightsData {
    title?: string;
    key_topics?: string[];
    features?: string[];
    students_enrolled?: string | number;
    rating?: string | number;
    duration?: string;
    image_url?: string;
}

interface BatchSchedule {
    id: string;
    date: string;
    day: string;
    title: string;
    subtitle: string;
    time: string;
    duration: string;
}

interface CourseDetailsResponse {
    highlights: HighlightsData;
    batch_schedules: BatchSchedule[];
}

interface EnrollmentResponse {
    success: boolean;
    message: string;
    data?: any; // Consider a more specific type if data structure is known
    error?: string;
    curriculum_download_url?: string; // Expecting this from Django backend
}

interface EnrollmentFormData {
    name: string;
    email: string;
    phone: string;
    extra_info: string;
    course_slug: string; // Renamed from course_id
    course_title: string;
    action?: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
}

const Highlights: React.FC = () => {
    const { id: courseSlug } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<HighlightsData | null>(null);
    const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // showSuccessMessage now stores the success data, if any, for the download link
    const [showSuccessMessage, setShowSuccessMessage] = useState<EnrollmentResponse | null>(null);

    // Contact modal states
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<EnrollmentFormData>({
        name: '',
        email: '',
        phone: '',
        extra_info: '',
        course_slug: courseSlug || '', // Initialize with courseSlug
        course_title: '' // Will be set after data loads
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Contact phone number
    const contactPhoneNumber = "+91 9666523199";

    // Form validation
    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.name || formData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email address.";
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
            errors.phone = "Please enter a valid 10-digit phone number.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof EnrollmentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing for that specific field
        if (formErrors[field as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            extra_info: '',
            course_slug: courseSlug || '',
            course_title: data?.title || ''
        });
        setFormErrors({});
    };

    // Contact functions
    const handleContactClick = () => {
        setIsContactModalOpen(true);
    };

    const handleCallClick = () => {
        window.location.href = `tel:${contactPhoneNumber}`;
        setIsContactModalOpen(false);
    };

    const handleWhatsAppClick = () => {
        const whatsappNumber = contactPhoneNumber.replace(/\D/g, '');
        const message = encodeURIComponent("Hi, I'm interested in the course and would like to speak with a course adviser.");
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        setIsContactModalOpen(false);
    };

    const copyPhoneNumber = () => {
        navigator.clipboard.writeText(contactPhoneNumber).then(() => {
            toast({
                title: "Phone number copied!",
                description: "The phone number has been copied to your clipboard.",
            });
        }).catch(() => {
            toast({
                title: "Copy failed",
                description: "Please copy the number manually.",
                variant: "destructive",
            });
        });
    };

    useEffect(() => {
        if (!courseSlug) {
            setError("Course ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        axiosInstance.get<CourseDetailsResponse>(`/courses/${courseSlug}/`)
            .then(res => {
                setData(res.data.highlights || null);
                setBatchSchedules(res.data.batch_schedules || []);
                // Set course_title in form data once highlights are loaded
                setFormData(prev => ({ ...prev, course_title: res.data.highlights?.title || 'Unknown Course' }));
            })
            .catch(err => {
                console.error("Error fetching course data:", err);
                setError(err.response?.data?.message || "Failed to load course details. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [courseSlug]);

    const handleDownloadCurriculumClick = () => {
        setIsModalOpen(true);
        setShowSuccessMessage(null); // Reset success message state
        resetForm(); // Reset form fields
    };

    const handleEnrollmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !courseSlug) return;

        setIsSubmitting(true);

        const submitData: EnrollmentFormData = {
            ...formData,
            course_slug: courseSlug, // This is already in formData, but ensures it's correctly updated
            course_title: data?.title || 'Unknown Course',
            action: 'curriculum_download',
        };

        try {
            // Using axiosInstance for consistency
            // Make sure your axiosInstance baseURL is set correctly (e.g., http://localhost:8000/api/)
            const response = await axiosInstance.post<EnrollmentResponse>(`/enroll/${courseSlug}/`, submitData);
            const result = response.data; // Axios puts the response data directly into .data

            if (response.status === 201 && result.success) { // Django returns 201 Created on success
                setShowSuccessMessage(result); // Store the entire result for download URL
                toast({
                    title: "Request Sent Successfully!",
                    description: result.message || "Thank you! Check your email for the curriculum and further details.",
                });
                // No need for setTimeout to close modal here, user can click "Got it!" or X
            } else {
                // Axios will typically throw an error for non-2xx responses,
                // so this else block might not be reached if an error occurs.
                // However, it's good for explicit server-side 'success: false' responses.
                const errorMessage = result.error || result.message || 'Submission failed. Please try again.';
                throw new Error(errorMessage);
            }
        } catch (axiosError: any) {
            console.error('Submission error:', axiosError);
            let errorMessage = "There was an issue processing your request. Please try again later.";
            if (axiosError.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = axiosError.response.data?.error || axiosError.response.data?.message || errorMessage;
            } else if (axiosError.request) {
                // The request was made but no response was received
                errorMessage = "No response from server. Please check your network connection.";
            }
            
            toast({
                title: "Submission Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        if (!isSubmitting) {
            setIsModalOpen(false);
            setShowSuccessMessage(null); // Clear success message
            resetForm();
        }
    };

    if (loading) {
        return (
            <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className={`h-12 w-12 animate-spin text-blue-600 mx-auto mb-4`} />
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

    const highlightStyles = `
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
    `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: highlightStyles }} />

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
                                                className={`h-5 w-5 text-blue-600 flex-shrink-0`}
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
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button
                                size="lg"
                                className="bg-white text-gray-800 hover:bg-blue-600 hover:text-white border-2 border-blue-600
                                rounded-lg px-6 py-4 text-base font-semibold shadow-md hover:shadow-blue-300/50
                                transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                                flex items-center justify-center space-x-1"
                                onClick={() => navigate('/signup')}
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Schedule Online Demo</span>
                            </Button>

                            <Button
                                size="lg"
                                className="bg-white text-gray-800 hover:bg-blue-600 hover:text-white border-2 border-blue-600
                                rounded-lg px-6 py-4 text-base font-semibold shadow-md hover:shadow-blue-300/50
                                transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                                flex items-center justify-center space-x-0"
                                onClick={handleContactClick}
                            >
                                <Phone className="w-5 h-5" />
                                <span>Contact Course Adviser</span>
                            </Button>

                            <Button
                                size="lg"
                                className="bg-white text-gray-800 hover:bg-blue-600 hover:text-white border-2 border-blue-600
                                rounded-lg px-6 py-4 text-base font-semibold shadow-md hover:shadow-blue-300/50
                                transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                                flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                                disabled:hover:transform-none disabled:hover:shadow-none"
                                onClick={handleDownloadCurriculumClick}
                                disabled={isSubmitting}
                            >
                                <Download className="w-5 h-5" />
                                <span>{isSubmitting ? 'Processing...' : 'Download Curriculum'}</span>
                            </Button>
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
                            onClick={handleContactClick}
                        >
                            Contact Us for Custom Schedule
                        </Button>
                    </div>
                </div>
            </section>

            {/* Contact Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center">
                            <Phone className="h-6 w-6 mr-2 text-blue-600" />
                            Contact Course Adviser
                        </DialogTitle>
                    </DialogHeader>

                    <div className="text-center py-6">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Get Instant Help
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Speak directly with our course adviser for personalized guidance
                            </p>
                        </div>
                        {/* Phone Number Display */}
                        <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center mb-4">
                            <span className="text-lg font-bold text-gray-800 mb-2">{contactPhoneNumber}</span>
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-4"
                                    onClick={handleCallClick}
                                >
                                    <Phone className="h-4 w-4 mr-1" /> Call Now
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700 rounded-full px-4"
                                    onClick={handleWhatsAppClick}
                                >
                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.366.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 6.318h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.991c-.003 5.456-4.438 9.891-9.895 9.891zm8.413-18.306A11.815 11.815 0 0012.05 0C5.495 0 .06 5.435.058 12c0 2.12.553 4.191 1.601 6.006L0 24l6.184-1.618A11.933 11.933 0 0012.051 24h.005c6.555 0 11.89-5.435 11.893-12.001a11.89 11.89 0 00-3.464-8.605z"/>
                                    </svg>
                                    WhatsApp
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full px-4"
                                    onClick={copyPhoneNumber}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={() => setIsContactModalOpen(false)}
                            >
                                <X className="h-5 w-5 mr-1" /> Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Enrollment/Download Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogContent className="sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center">
                            {showSuccessMessage ? "Thank You!" : "Download Curriculum"}
                        </DialogTitle>
                    </DialogHeader>
                    {showSuccessMessage ? (
                        <div className="text-center py-6">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your request has been submitted!</h3>
                            <p className="text-gray-600 mb-4">
                                {showSuccessMessage.message || "We've sent the curriculum and further details to your email address. Please check your inbox (and spam folder)."}
                            </p>
                            {showSuccessMessage.curriculum_download_url && (
                                <Button
                                    size="lg"
                                    className={`bg-green-600 text-white hover:bg-green-700 rounded-md px-6 py-3 mr-2`}
                                    onClick={() => window.open(showSuccessMessage.curriculum_download_url, '_blank')}
                                >
                                    <Download className="w-5 h-5 mr-2" /> Download Now
                                </Button>
                            )}
                            <Button
                                size="lg"
                                className={`bg-blue-600 text-white hover:bg-blue-700 rounded-md px-6 py-3 ${showSuccessMessage.curriculum_download_url ? '' : 'w-full'}`}
                                onClick={handleModalClose}
                            >
                                Got it!
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleEnrollmentSubmit} className="space-y-6 py-4">
                            <p className="text-center text-gray-600">
                                Please fill in your details to download the curriculum.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={formErrors.name ? "border-red-500" : ""}
                                />
                                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={formErrors.email ? "border-red-500" : ""}
                                />
                                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={formErrors.phone ? "border-red-500" : ""}
                                />
                                {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="extra_info">Anything else we should know? (Optional)</Label>
                                <Textarea
                                    id="extra_info"
                                    placeholder="e.g., 'I am interested in weekend batches.'"
                                    value={formData.extra_info}
                                    onChange={(e) => handleInputChange('extra_info', e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className={`w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md px-6 py-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                                ) : (
                                    <><Download className="mr-2 h-5 w-5" /> Get Curriculum</>
                                )}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Highlights;