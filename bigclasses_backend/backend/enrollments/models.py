from django.db import models
from django.utils import timezone
import uuid

class Enrollment(models.Model):
    # ...existing fields...
    email = models.EmailField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    # ...other fields...

    def generate_verification_token(self):
        self.verification_token = uuid.uuid4().hex
        self.save()

