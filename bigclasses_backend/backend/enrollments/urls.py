from django.urls import path
from .views import EnrollmentView

urlpatterns = [
    path('enroll/', EnrollmentView.as_view(), name='enroll'),
]
