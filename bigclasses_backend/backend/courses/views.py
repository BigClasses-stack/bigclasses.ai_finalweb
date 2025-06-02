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
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from .models import Course
from .serializers import CourseSerializer, CourseDetailSerializer

logger = logging.getLogger(__name__)

# Your Google Apps Script Web App URL (replace with your actual URL)
GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxxu2LFxZeyfLSzCHTzrycwIAyEumcd0LjxdR7H2ilPDmr1-pHxVQEES0NT5tci_pWz/exec"

class CourseListView(ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return Course.objects.prefetch_related(
            'highlights',
            'overview',
            'curriculum',
            'curriculum__topics'
        ).all()

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Course.DoesNotExist:
            logger.error(f"Course with id {kwargs.get('id')} not found")
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

# NEW ENROLLMENT VIEW
@method_decorator(csrf_exempt, name='dispatch')
class EnrollDownloadView(View):
    def post(self, request, id):
        try:
            # Parse the JSON data from the request
            data = json.loads(request.body)
            
            # Extract form data
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            extra_info = data.get('extra_info', '').strip()
            
            # Basic validation
            if not all([name, email, phone]):
                return JsonResponse({
                    'success': False,
                    'error': 'Name, email, and phone are required fields'
                }, status=400)
            
            # Get course information
            try:
                course = get_object_or_404(Course, id=id)
                course_title = course.title if hasattr(course, 'title') else f"Course {id}"
            except:
                course_title = f"Course {id}"
            
            # Prepare data for Google Sheets
            sheet_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'extra_info': extra_info,
                'course_id': id,
                'course_title': course_title,
                'timestamp': '',  # Will be filled by Google Apps Script
            }
            
            # Send data to Google Sheets
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
                # Continue with the process even if Google Sheets fails
            
            # Send email to user
            try:
                self.send_user_email(name, email, course_title)
            except Exception as e:
                logger.warning(f"Failed to send user email: {e}")
            
            # Send email to company
            try:
                self.send_company_email(name, email, phone, course_title, extra_info)
            except Exception as e:
                logger.warning(f"Failed to send company email: {e}")
            
            return JsonResponse({
                'success': True,
                'message': 'Enrollment successful! Check your email for confirmation.'
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
        """Send confirmation email to the user"""
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
        """Send notification email to company"""
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
        
        # Get company email from settings
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
    
    def get(self, request, id):
        try:
            # Get the course object
            course = get_object_or_404(Course, id=id)
            
            # Check if curriculum file exists
            if not course.curriculum_file:
                logger.warning(f"No curriculum file found for course {id}")
                return Response(
                    {"error": "No curriculum file available for this course"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if file exists on disk
            if not course.curriculum_file.storage.exists(course.curriculum_file.name):
                logger.error(f"Curriculum file not found on disk for course {id}")
                return Response(
                    {"error": "Curriculum file not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get file path and info
            file_path = course.curriculum_file.path
            file_name = course.get_curriculum_filename()
            print("############################## Debugging Curriculum Download ##############################")
            print(f"File path: {file_path}, File name: {file_name}")
            print(f"File exists: {os.path.exists(file_path)}")

            print("############################## Debugging Curriculum Download ##############################")
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Log download attempt
            logger.info(f"Downloading curriculum file for course {id}: {file_name}")
            
            try:
                # Use FileResponse for better handling of large files
                response = FileResponse(
                    open(file_path, 'rb'),
                    content_type=content_type,
                    as_attachment=True,
                    filename=file_name
                )
                
                # Add additional headers
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
            logger.error(f"Course with id {id} not found for download")
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Unexpected error in curriculum download for course {id}: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CurriculumInfoView(APIView):
    """
    API endpoint to get curriculum file information without downloading
    """
    
    def get(self, request, id):
        try:
            course = get_object_or_404(Course, id=id)
            
            if not course.curriculum_file:
                return Response({
                    "has_file": False,
                    "message": "No curriculum file available"
                })
            
            # Get file information
            file_size = course.curriculum_file.size
            file_name = course.get_curriculum_filename()
            file_extension = course.get_file_extension()
            uploaded_at = course.file_uploaded_at
            
            # Convert file size to human readable format
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
                "download_url": f"/api/courses/{id}/download-curriculum/"
            })
            
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting curriculum info for course {id}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )