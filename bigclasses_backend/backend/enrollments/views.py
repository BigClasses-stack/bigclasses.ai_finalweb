# enrollments/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from datetime import datetime
import requests
import logging
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.http import HttpResponse, Http404
from courses.models import Course  # Import Course model
import os
import mimetypes # Import mimetypes for robust MIME type detection

logger = logging.getLogger(__name__)

# --- IMPORTANT: Replace this with your actual Google Sheet Webhook URL ---
GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwvi9dftVRqHY7UfWZiByefOvQEusjbUiYGD7z_z6ghHPKOTwqe8oug2synQB70rt4m/exec"

def send_curriculum_email(email, student_name, course_slug, course_title, request=None):
    """
    Send curriculum email to the user with either an attachment or a download link.
    Includes robust checks for file existence and MIME type detection.
    
    Args:
        email (str): The recipient's email address.
        student_name (str): The student's name.
        course_slug (str): The slug of the course.
        course_title (str): The title of the course.
        request (HttpRequest, optional): The Django HttpRequest object. 
                                         Used to build absolute URLs if provided.
    """
    try:
        course = Course.objects.get(slug=course_slug)
        subject = f"{course_title} Curriculum from BigClasses.ai"
        
        # Construct the download link dynamically using request.build_absolute_uri
        # If 'request' is not available (e.g., in a background task), fall back to a placeholder
        # You should replace 'yourdomain.com' with your actual production domain.
        if request:
            download_link = request.build_absolute_uri(f"/api/courses/{course_slug}/download-curriculum/")
        else:
            # Fallback for when request is not available (e.g., if this function
            # were called from a management command or a background worker without a request context).
            # This 'yourdomain.com' MUST be replaced with your actual domain for production.
            download_link = f"https://yourdomain.com/api/courses/{course_slug}/download-curriculum/" 
        
        # Render the email message from template
        message = render_to_string('emails/curriculum_email.html', {
            'student_name': student_name,
            'course_title': course_title,
            'download_link': download_link
        })
        
        # Create EmailMessage instance
        # Using settings.DEFAULT_FROM_EMAIL which is pulled from .env
        mail = EmailMessage(subject, message, from_email=settings.DEFAULT_FROM_EMAIL, to=[email])
        mail.content_subtype = "html" # Set email content type to HTML
        
        # --- Attachment Logic ---
        if course.curriculum_file and course.curriculum_file.name: # Check if a file is assigned
            logger.debug(f"Attempting to attach curriculum file for course: {course_slug}")
            logger.debug(f"Curriculum file name in DB: {course.curriculum_file.name}")
            
            try:
                # Get the absolute path to the file
                file_path = course.curriculum_file.path 
                
                # Verify that the file physically exists on the filesystem
                if os.path.exists(file_path):
                    original_filename = os.path.basename(course.curriculum_file.name)
                    
                    # Guess the MIME type based on the file extension
                    mime_type, _ = mimetypes.guess_type(file_path)
                    if not mime_type:
                        # Fallback to a generic binary stream if MIME type cannot be guessed
                        mime_type = 'application/octet-stream' 

                    # Attach the file
                    mail.attach_file(file_path, mimetype=mime_type)
                    logger.info(f"Successfully attached curriculum file: '{original_filename}' from path: '{file_path}' with MIME type: '{mime_type}'")
                else:
                    logger.error(f"Curriculum file does NOT physically exist at path: '{file_path}'. Email will be sent without attachment.")
                    # Do NOT return False here if you want the email to send with just the link.
                    # The email will still be sent below.
            except Exception as attach_exc:
                logger.error(f"Error during file attachment process for '{course.curriculum_file.name}': {attach_exc}", exc_info=True)
                # Do NOT return False here if you want the email to send with just the link.
        else:
            logger.warning(f"Course '{course_title}' (slug: {course_slug}) has no curriculum_file assigned in the database. Email will be sent without attachment.")
        
        # Send the email
        mail.send(fail_silently=False) # fail_silently=False will raise exceptions like SMTPAuthenticationError
        logger.info(f"Curriculum email sent successfully to {email} for course {course_title}")
        return True
        
    except Course.DoesNotExist:
        logger.error(f"Course with slug '{course_slug}' does not exist for email sending. Email not sent.")
        return False
    except Exception as e:
        logger.error(f"General error in send_curriculum_email for {email}: {str(e)}", exc_info=True)
        return False

class CurriculumDownloadView(APIView):
    """
    View to handle direct curriculum download.
    Accessed via a GET request to /api/courses/<slug>/download-curriculum/
    """
    def get(self, request, slug):
        try:
            course = Course.objects.get(slug=slug)
            
            # Basic checks for file existence in model and storage
            if not course.curriculum_file or not course.curriculum_file.name:
                logger.error(f"Download request for course '{slug}': No curriculum_file assigned in database.")
                raise Http404("Curriculum file not found for this course.")
            
            if not course.curriculum_file.storage.exists(course.curriculum_file.name):
                logger.error(f"Download request for course '{slug}': Curriculum file does not exist in storage: {course.curriculum_file.name}")
                raise Http404("Curriculum file does not exist in storage.")
            
            file_path = course.curriculum_file.path
            
            # Verify that the file physically exists on the filesystem
            if not os.path.exists(file_path):
                logger.error(f"Download request for course '{slug}': Curriculum file path does not physically exist: {file_path}")
                raise Http404("Curriculum file is missing on the server.")
            
            # Read file content in binary mode
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            original_filename = os.path.basename(course.curriculum_file.name)
            
            # Guess the MIME type for the response
            mime_type, _ = mimetypes.guess_type(original_filename)
            if not mime_type:
                mime_type = 'application/octet-stream' # Fallback for unknown types
            
            # Create the HttpResponse with file content and headers for download
            response = HttpResponse(file_content, content_type=mime_type)
            response['Content-Disposition'] = f'attachment; filename="{original_filename}"'
            response['Content-Length'] = len(file_content)
            
            logger.info(f"Curriculum download initiated for course: '{slug}' - File: '{original_filename}'")
            return response
            
        except Course.DoesNotExist:
            logger.error(f"Download request: Course with slug '{slug}' does not exist.")
            raise Http404("Course not found for download.")
        except Http404: # Catch Http404 specifically to log it and re-raise for Django's handler
            raise 
        except Exception as e:
            logger.error(f"Unexpected error in curriculum download for slug '{slug}': {str(e)}", exc_info=True)
            raise Http404("An unexpected error occurred during download.") # Generic error for user

class EnrollmentView(APIView):
    renderer_classes = [JSONRenderer]

    def post(self, request, slug=None):
        try:
            student_name = request.data.get('student_name') or request.data.get('name', '').strip()
            email = request.data.get('email', '').strip().lower()
            course_title = request.data.get('course_title') or request.data.get('course_title', '').strip()
            phone = request.data.get('phone', '').strip()
            extra_info = request.data.get('extra_info', '').strip()
            course_slug = slug or request.data.get('course_slug', '').strip()

            if not all([student_name, email, course_title, phone]):
                logger.warning(f"Enrollment attempt failed: Missing required fields for {email}.")
                return Response({'success': False, 'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if course exists
            try:
                course = Course.objects.get(slug=course_slug)
            except Course.DoesNotExist:
                logger.error(f"Enrollment attempt for non-existent course slug: {course_slug}")
                return Response({'success': False, 'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

            sheet_data = {
                'name': student_name,
                'email': email,
                'phone': phone,
                'extra_info': extra_info,
                'course_slug': course_slug,
                'course_title': course_title,
                'timestamp': datetime.now().isoformat(),
                'send_user_email': True,
                'send_company_email': True,
            }

            try:
                # Send data to Google Sheets webhook
                response = requests.post(
                    GOOGLE_SHEET_WEBHOOK_URL,
                    json=sheet_data,
                    timeout=10
                )
                logger.info(f"Google Sheets webhook response status: {response.status_code}")
                logger.info(f"Google Sheets webhook response body: {response.text}")

                if response.status_code == 200:
                    # Send curriculum email after successful enrollment (pass request object)
                    email_sent = send_curriculum_email(
                        email=email,
                        student_name=student_name,
                        course_slug=course_slug,
                        course_title=course_title,
                        request=request # Pass the request object
                    )
                    
                    response_data = {
                        'success': True,
                        'message': 'Enrollment successful! Check your email for confirmation.',
                        'data': sheet_data
                    }
                    
                    # Add curriculum download link to response if available
                    # We check course.curriculum_file.name instead of just course.curriculum_file
                    # to ensure the FileField actually has a file path associated with it.
                    if course.curriculum_file and course.curriculum_file.name and course.curriculum_file.storage.exists(course.curriculum_file.name):
                        # Ensure the URL is absolute for frontend use if needed
                        response_data['curriculum_download_url'] = request.build_absolute_uri(f"/api/courses/{course_slug}/download-curriculum/")
                        if email_sent:
                            response_data['message'] += ' Curriculum has been sent to your email.'
                        else:
                            response_data['message'] += ' You can download the curriculum using the provided link.'
                    else:
                        response_data['message'] += ' Curriculum will be provided separately.' # Or via the download link if email failed
                    
                    if not email_sent:
                        logger.warning("Curriculum email could not be sent to user.")
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
                else:
                    error_message = f"Google Sheets API error (status {response.status_code}): {response.text}"
                    try:
                        response_json = response.json()
                        if 'error' in response_json:
                            error_message = f"Google Sheets API error: {response_json['error']}"
                    except Exception:
                        pass # Ignore JSON parsing error if response is not JSON
                    logger.warning(error_message)
                    return Response({
                        'success': False,
                        'error': 'Failed to process enrollment with Google Sheets. Please try again.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to send data to Google Sheets webhook due to network/request error: {e}", exc_info=True)
                return Response({
                    'success': False,
                    'error': 'Failed to process enrollment due to network issues. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An unexpected error occurred during enrollment: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'error': f'Enrollment failed due to an internal error. Please contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)