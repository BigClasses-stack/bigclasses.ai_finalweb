from django.urls import path
from .views import EnrollmentView, verify_enrollment

urlpatterns = [
    path('enroll/', EnrollmentView.as_view(), name='enroll'),
    path('verify/<str:token>/', verify_enrollment, name='verify-enrollment'),
]
