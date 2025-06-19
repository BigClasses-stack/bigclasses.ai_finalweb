import logging
import os
import mimetypes
import json
import requests
from django.http import HttpResponse, Http404, FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
import dns.resolver

from .models import Course, BatchSchedule
from .serializers import CourseSerializer, CourseDetailSerializer, BatchScheduleSerializer
from enrollments.models import Enrollment
from django.urls import reverse

logger = logging.getLogger(__name__)

GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxxu2LFxZeyfLSzCHTzrycwIAyEumcd0LjxdR7H2ilPDmr1-pHxVQEES0NT5tci_pWz/exec"

class CourseListView(ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.prefetch_related(
            'highlights',
            'overview',
            'curriculum',
            'curriculum__topics',
            'batch_schedules'
        ).all()

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Course.DoesNotExist:
            logger.error(f"Course with slug {kwargs.get('slug')} not found")
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving course: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CourseBatchSchedulesView(APIView):
    """
    API endpoint to get batch schedules for a specific course
    """
    def get(self, request, slug):
        try:
            course = get_object_or_404(Course, slug=slug)
            
            # Get active batch schedules ordered by batch number
            batch_schedules = course.batch_schedules.filter(is_active=True).order_by('batch_number')
            
            if not batch_schedules.exists():
                return Response({
                    "course_title": course.title,
                    "course_slug": course.slug,
                    "batch_schedules": [],
                    "total_batches": 0,
                    "message": "No active batch schedules available for this course"
                })
            
            serializer = BatchScheduleSerializer(batch_schedules, many=True)
            
            return Response({
                "course_title": course.title,
                "course_slug": course.slug,
                "batch_schedules": serializer.data,
                "total_batches": batch_schedules.count()
            })
            
        except Course.DoesNotExist:
            logger.error(f"Course with slug {slug} not found for batch schedules")
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving batch schedules for course {slug}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AllBatchSchedulesView(ListAPIView):
    """
    API endpoint to get all batch schedules across all courses
    """
    def get(self, request):
        try:
            # Get all active batch schedules with course information
            batch_schedules = BatchSchedule.objects.filter(
                is_active=True
            ).select_related('course').order_by('course__title', 'batch_number')
            
            if not batch_schedules.exists():
                return Response({
                    "batch_schedules": [],
                    "total_count": 0,
                    "message": "No active batch schedules available"
                })
            
            # Group by course for better organization
            courses_with_batches = {}
            for batch in batch_schedules:
                course_slug = batch.course.slug
                if course_slug not in courses_with_batches:
                    courses_with_batches[course_slug] = {
                        "course_title": batch.course.title,
                        "course_slug": course_slug,
                        "batches": []
                    }
                
                batch_data = BatchScheduleSerializer(batch).data
                courses_with_batches[course_slug]["batches"].append(batch_data)
            
            return Response({
                "courses_with_batches": list(courses_with_batches.values()),
                "total_courses": len(courses_with_batches),
                "total_batches": batch_schedules.count()
            })
            
        except Exception as e:
            logger.error(f"Error retrieving all batch schedules: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class EnrollDownloadView(View):
    def post(self, request, slug):
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            extra_info = data.get('extra_info', '').strip()

            if not all([name, email, phone]):
                return JsonResponse({
                    'success': False,
                    'error': 'Name, email, and phone are required fields'
                }, status=400)

            # --- Email existence check ---
            # Syntax check
            try:
                validate_email(email)
            except DjangoValidationError:
                return JsonResponse({'success': False, 'error': 'Invalid email format'}, status=400)
            # MX record check
            domain = email.split('@')[-1]
            try:
                dns.resolver.resolve(domain, 'MX')
            except Exception:
                return JsonResponse({'success': False, 'error': 'Email domain does not exist'}, status=400)
            # (Optional) Already enrolled check
            try:
                course = get_object_or_404(Course, slug=slug)
                course_title = course.title if hasattr(course, 'title') else f"Course {slug}"
            except:
                return JsonResponse({'success': False, 'error': 'Course not found'}, status=404)
            if Enrollment.objects.filter(email=email, course=course).exists():
                return JsonResponse({'success': False, 'error': 'Email already enrolled'}, status=400)
            # --- End email check ---

            # Save enrollment as unverified (or verified, since no verification step)
            enrollment, created = Enrollment.objects.get_or_create(
                email=email, course=course,
                defaults={'is_verified': True}
            )

            # Send curriculum file as attachment if available
            curriculum_sent = False
            if hasattr(course, 'curriculum_file') and course.curriculum_file and course.curriculum_file.storage.exists(course.curriculum_file.name):
                file_path = course.curriculum_file.path
                file_name = course.get_curriculum_filename()
                subject = f"{course_title} - Curriculum Download"
                message = f"Dear {name},\n\nThank you for enrolling in {course_title}.\nPlease find the curriculum attached.\n\nBest regards,\nBigclasses.ai"
                email_msg = EmailMessage(
                    subject=subject,
                    body=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                    to=[email]
                )
                email_msg.attach_file(file_path)
                try:
                    email_msg.send(fail_silently=False)
                    curriculum_sent = True
                except Exception as e:
                    logger.error(f"Failed to send curriculum to {email}: {e}")
                    curriculum_sent = False

            sheet_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'extra_info': extra_info,
                'course_slug': slug,
                'course_title': course_title,
                'timestamp': '',
            }
            try:
                response = requests.post(
                    GOOGLE_SHEET_WEBHOOK_URL,
                    json=sheet_data,
                    timeout=10
                )
                if response.status_code != 200:
                    logger.warning(f"Google Sheets API error: {response.text}")
            except requests.exceptions.RequestException as e:
                logger.warning(f"Failed to send data to Google Sheets: {e}")

            try:
                self.send_user_email(name, email, course_title)
            except Exception as e:
                logger.warning(f"Failed to send user email: {e}")

            try:
                self.send_company_email(name, email, phone, course_title, extra_info)
            except Exception as e:
                logger.warning(f"Failed to send company email: {e}")

            return JsonResponse({
                'success': True,
                'message': 'Enrollment successful! The curriculum has been sent to your email.' if curriculum_sent else 'Enrollment successful! But failed to send curriculum to your email.'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            logger.error(f"Enrollment error: {e}")
            return JsonResponse({
                'success': False,
                'error': 'An error occurred during enrollment. Please try again.'
            }, status=500)

    def send_user_email(self, name, email, course_title):
        subject = f"Course Enrollment Confirmation - {course_title}"
        message = f"""
Dear {name},

Thank you for your interest in "{course_title}"!

We have received your enrollment request and curriculum download. Our team will contact you shortly with more details about the course.

If you have any questions, please don't hesitate to reach out to us.

Best regards,
Bigclasses.ai
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
            recipient_list=[email],
            fail_silently=True,
        )

    def send_company_email(self, name, email, phone, course_title, extra_info):
        subject = f"New Course Enrollment - {course_title}"
        message = f"""
New course enrollment received:

Course: {course_title}
Name: {name}
Email: {email}
Phone: {phone}
Additional Info: {extra_info or 'None provided'}

Please follow up with the student.
        """

        company_email = getattr(settings, 'COMPANY_EMAIL', 'admin@yourcompany.com')

        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
            recipient_list=[company_email],
            fail_silently=True,
        )

class CurriculumDownloadView(APIView):
    """
    API endpoint for downloading curriculum files
    """
    def get(self, request, slug):
        email = request.GET.get('email')
        if not email:
            return Response({"error": "Email required"}, status=400)
        from enrollments.models import Enrollment
        if not Enrollment.objects.filter(email=email, course__slug=slug, is_verified=True).exists():
            return Response({"error": "Email not verified"}, status=403)

        try:
            course = get_object_or_404(Course, slug=slug)
            if not course.curriculum_file:
                logger.warning(f"No curriculum file found for course {slug}")
                return Response(
                    {"error": "No curriculum file available for this course"},
                    status=status.HTTP_404_NOT_FOUND
                )
            if not course.curriculum_file.storage.exists(course.curriculum_file.name):
                logger.error(f"Curriculum file not found on disk for course {slug}")
                return Response(
                    {"error": "Curriculum file not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            file_path = course.curriculum_file.path
            file_name = course.get_curriculum_filename()
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            logger.info(f"Downloading curriculum file for course {slug}: {file_name}")
            try:
                response = FileResponse(
                    open(file_path, 'rb'),
                    content_type=content_type,
                    as_attachment=True,
                    filename=file_name
                )
                response['Content-Length'] = os.path.getsize(file_path)
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response
            except IOError as e:
                logger.error(f"Error reading file {file_path}: {str(e)}")
                return Response(
                    {"error": "Error reading curriculum file"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Course.DoesNotExist:
            logger.error(f"Course with slug {slug} not found for download")
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Unexpected error in curriculum download for course {slug}: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CurriculumInfoView(APIView):
    """
    API endpoint to get curriculum file information without downloading
    """
    def get(self, request, slug):
        try:
            course = get_object_or_404(Course, slug=slug)
            if not course.curriculum_file:
                return Response({
                    "has_file": False,
                    "message": "No curriculum file available"
                })
            file_size = course.curriculum_file.size
            file_name = course.get_curriculum_filename()
            file_extension = course.get_file_extension()
            uploaded_at = course.file_uploaded_at

            def format_file_size(size_bytes):
                if size_bytes == 0:
                    return "0 B"
                size_names = ["B", "KB", "MB", "GB"]
                import math
                i = int(math.floor(math.log(size_bytes, 1024)))
                p = math.pow(1024, i)
                s = round(size_bytes / p, 2)
                return f"{s} {size_names[i]}"

            return Response({
                "has_file": True,
                "file_name": file_name,
                "file_extension": file_extension,
                "file_size": format_file_size(file_size),
                "file_size_bytes": file_size,
                "uploaded_at": uploaded_at.isoformat() if uploaded_at else None,
                "download_url": f"/api/courses/{slug}/download-curriculum/"
            })
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting curriculum info for course {slug}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyEmailView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        # 1. Syntax check
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({'isValid': False, 'reason': 'Invalid format'}, status=200)
        # 2. MX record check
        domain = email.split('@')[-1]
        try:
            dns.resolver.resolve(domain, 'MX')
        except Exception:
            return Response({'isValid': False, 'reason': 'No MX records'}, status=200)
        # 3. (Optional) Check if already enrolled
        from enrollments.models import Enrollment
        if Enrollment.objects.filter(email=email).exists():
            return Response({'isValid': False, 'reason': 'Already enrolled'}, status=200)
        return Response({'isValid': True}, status=200)