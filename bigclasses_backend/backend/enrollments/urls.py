from django.urls import path
from .views import EnrollmentView

urlpatterns = [
    path('enroll/<slug:slug>/', EnrollmentView.as_view(), name='enroll'),
]
