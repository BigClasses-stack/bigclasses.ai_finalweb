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
from django.conf import settings # Make sure settings is imported if you move WEBHOOK_URL
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from .models import Course, BatchSchedule
from .serializers import CourseSerializer, CourseDetailSerializer, BatchScheduleSerializer
from datetime import datetime # Import datetime if you decide to send timestamps from Django

logger = logging.getLogger(__name__)

# It's recommended to move this to settings.py
# GOOGLE_SHEET_WEBHOOK_URL = settings.GOOGLE_SHEET_WEBHOOK_URL
GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbweDIIFBznOb0nn2qznj3r0-3q0LOdkvT4V0mFfVjbOn6j0jBLkliNhJwYUTHUw-asM/exec"

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
            # Get the course details first. If not found, return 404 immediately.
            try:
                course = get_object_or_404(Course, slug=slug)
                course_title = course.title
            except Http404:
                logger.error(f"Enrollment attempt for non-existent course slug: {slug}")
                return JsonResponse({
                    'success': False,
                    'error': 'Course not found.'
                }, status=404)

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

            sheet_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'extra_info': extra_info,
                'course_slug': slug,
                'course_title': course_title,
                'timestamp': datetime.now().isoformat(), # Send current timestamp from Django
                'send_user_email': True,
                'send_company_email': True,
            }

            try:
                response = requests.post(
                    GOOGLE_SHEET_WEBHOOK_URL,
                    json=sheet_data,
                    timeout=10
                )
                
                # Log the full response for debugging purposes
                logger.info(f"Google Sheets webhook response status: {response.status_code}")
                logger.info(f"Google Sheets webhook response body: {response.text}")

                if response.status_code != 200:
                    # Attempt to get a more specific error from the response if available
                    error_message = f"Google Sheets API error: {response.text}"
                    try:
                        response_json = response.json()
                        if 'error' in response_json:
                            error_message = f"Google Sheets API error: {response_json['error']}"
                    except json.JSONDecodeError:
                        pass # Not a JSON response, use full text

                    logger.warning(error_message)
                    return JsonResponse({
                        'success': False,
                        'error': 'Failed to process enrollment. Please try again.'
                    }, status=500)
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to send data to Google Sheets: {e}", exc_info=True) # Add exc_info for full traceback
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to process enrollment due to network issues. Please try again.'
                }, status=500)

            return JsonResponse({
                'success': True,
                'message': 'Enrollment successful! Check your email for confirmation.'
            })

        except json.JSONDecodeError:
            logger.error("Invalid JSON data received for enrollment request.")
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data provided.'
            }, status=400)
        except Exception as e:
            logger.error(f"An unexpected error occurred during enrollment processing: {e}", exc_info=True)
            return JsonResponse({
                'success': False,
                'error': 'An internal server error occurred during enrollment. Please try again.'
            }, status=500)

class CurriculumDownloadView(APIView):
    """
    API endpoint for downloading curriculum files
    """
    def get(self, request, slug):
        try:
            course = get_object_or_404(Course, slug=slug)
            if not course.curriculum_file:
                logger.warning(f"No curriculum file found for course {slug}")
                return Response(
                    {"error": "No curriculum file available for this course"},
                    status=status.HTTP_404_NOT_FOUND
                )
            # Check if the file actually exists on storage
            if not course.curriculum_file.storage.exists(course.curriculum_file.name):
                logger.error(f"Curriculum file not found on disk for course {slug}: {course.curriculum_file.name}")
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
                logger.error(f"Error reading file {file_path}: {str(e)}", exc_info=True)
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
            logger.error(f"Error getting curriculum info for course {slug}: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )