import logging
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from .models import Course
from .serializers import CourseSerializer, CourseDetailSerializer
logger = logging.getLogger(__name__)
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
