from django.urls import path
from .views import (
    CourseListView, 
    CourseDetailView, 
    CurriculumDownloadView, 
    CurriculumInfoView,
    EnrollDownloadView  # NEW IMPORT
)

urlpatterns = [
    # Existing URLs
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:id>/', CourseDetailView.as_view(), name='course-detail'),
    
    # Existing download URLs
    path('<int:id>/download-curriculum/', CurriculumDownloadView.as_view(), name='curriculum-download'),
    path('<int:id>/curriculum-info/', CurriculumInfoView.as_view(), name='curriculum-info'),
    
    # NEW ENROLLMENT URL
    path('<int:id>/enroll-download/', EnrollDownloadView.as_view(), name='enroll-download'),
]