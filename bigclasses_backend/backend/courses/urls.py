from django.urls import path
from .views import (
    CourseListView, 
    CourseDetailView, 
    CurriculumDownloadView, 
    CurriculumInfoView,
    EnrollDownloadView  # NEW IMPORT
)

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),    
    
    # Change these to use slug instead of id
    path('<slug:slug>/download-curriculum/', CurriculumDownloadView.as_view(), name='curriculum-download'),
    path('<slug:slug>/curriculum-info/', CurriculumInfoView.as_view(), name='curriculum-info'),
    path('<slug:slug>/enroll-download/', EnrollDownloadView.as_view(), name='enroll-download'),
]
