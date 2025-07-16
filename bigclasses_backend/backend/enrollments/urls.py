from django.urls import path
from .views import EnrollmentView, CurriculumDownloadView

urlpatterns = [
    path('enroll/<slug:slug>/', EnrollmentView.as_view(), name='enroll'),
    path('api/courses/<str:slug>/download-curriculum/', CurriculumDownloadView.as_view(), name='curriculum-download'),

]
