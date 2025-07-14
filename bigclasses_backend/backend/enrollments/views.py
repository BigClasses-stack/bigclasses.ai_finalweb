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
from courses.models import Course  # Import Course model

logger = logging.getLogger(__name__)

GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbweDIIFBznOb0nn2qznj3r0-3q0LOdkvT4V0mFfVjbOn6j0jBLkliNhJwYUTHUw-asM/exec"

def send_curriculum_email(email, student_name, course_slug, course_title):
    """
    Send curriculum email to the user with either an attachment or a download link.
    """
    try:
        course = Course.objects.get(slug=course_slug)
        subject = f"{course_title} Curriculum Download"
        # You can use a template for the email body
        message = render_to_string('emails/curriculum_email.html', {
            'student_name': student_name,
            'course_title': course_title,
            'download_link': f"https://yourdomain.com/api/courses/{course_slug}/download-curriculum/"
        })
        mail = EmailMessage(subject, message, to=[email])
        mail.content_subtype = "html"
        # Attach file if available
        if course.curriculum_file:
            logger.debug(f"Curriculum file name: {course.curriculum_file.name}")
            logger.debug(f"Curriculum file path: {getattr(course.curriculum_file, 'path', None)}")
            if course.curriculum_file.storage.exists(course.curriculum_file.name):
                try:
                    mail.attach_file(course.curriculum_file.path)
                    logger.info(f"Attached curriculum file: {course.curriculum_file.path}")
                except Exception as attach_exc:
                    logger.error(f"Error attaching curriculum file: {attach_exc}")
            else:
                logger.warning(f"Curriculum file does not exist on storage: {course.curriculum_file.name}")
        else:
            logger.warning("Course has no curriculum_file set.")
        mail.send()
        logger.info(f"Curriculum email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send curriculum email: {str(e)}", exc_info=True)
        return False

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
                return Response({'success': False, 'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

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
                response = requests.post(
                    GOOGLE_SHEET_WEBHOOK_URL,
                    json=sheet_data,
                    timeout=10
                )
                logger.info(f"Google Sheets webhook response status: {response.status_code}")
                logger.info(f"Google Sheets webhook response body: {response.text}")

                if response.status_code == 200:
                    # Send curriculum email after successful enrollment
                    email_sent = send_curriculum_email(
                        email=email,
                        student_name=student_name,
                        course_slug=course_slug,
                        course_title=course_title
                    )
                    if not email_sent:
                        logger.warning("Curriculum email could not be sent.")
                    return Response({
                        'success': True,
                        'message': 'Enrollment successful! Check your email for confirmation and curriculum.',
                        'data': sheet_data
                    }, status=status.HTTP_201_CREATED)
                else:
                    error_message = f"Google Sheets API error: {response.text}"
                    try:
                        response_json = response.json()
                        if 'error' in response_json:
                            error_message = f"Google Sheets API error: {response_json['error']}"
                    except Exception:
                        pass
                    logger.warning(error_message)
                    return Response({
                        'success': False,
                        'error': 'Failed to process enrollment. Please try again.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to send data to Google Sheets: {e}", exc_info=True)
                return Response({
                    'success': False,
                    'error': 'Failed to process enrollment due to network issues. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Enrollment error: {str(e)}")
            return Response({
                'success': False,
                'error': f'Enrollment failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Enrollment error: {str(e)}")
            # Return JSON error response
            return Response({
                'success': False,
                'error': f'Enrollment failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
