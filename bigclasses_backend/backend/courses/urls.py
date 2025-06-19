from django.urls import path
from .views import (
    CourseListView, 
    CourseDetailView, 
    CurriculumDownloadView, 
    CurriculumInfoView,
    EnrollDownloadView,
    CourseBatchSchedulesView,
    AllBatchSchedulesView,
    VerifyEmailView,  # This must exist in views.py!
)

urlpatterns = [
    # Course list and detail
    path('', CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),    
    
    # Curriculum related endpoints
    path('<slug:slug>/download-curriculum/', CurriculumDownloadView.as_view(), name='curriculum-download'),
    path('<slug:slug>/curriculum-info/', CurriculumInfoView.as_view(), name='curriculum-info'),
    
    # Enrollment endpoint
    path('<slug:slug>/enroll-download/', EnrollDownloadView.as_view(), name='enroll-download'),
    
    # Batch schedule endpoints - NEW ADDITIONS
    path('<slug:slug>/batch-schedules/', CourseBatchSchedulesView.as_view(), name='course-batch-schedules'),
    path('batch-schedules/all/', AllBatchSchedulesView.as_view(), name='all-batch-schedules'),

    # Email verification endpoint
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
]