from django.db import models
from django.utils import timezone
from django.utils.text import slugify
import time
class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    image = models.URLField(blank=True, null=True)
    students_enrolled = models.PositiveIntegerField()
    duration = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    rating = models.FloatField()
    modules_count = models.PositiveIntegerField()

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            timestamp = int(time.time())
            self.slug = f"{slugify(self.title)}-{timestamp}"
        super().save(*args, **kwargs)

class Overview(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='overview')
    average_package = models.CharField(max_length=50)
    average_hike = models.CharField(max_length=50)
    transitions = models.CharField(max_length=50)
    salary_min = models.CharField(max_length=50)
    salary_avg = models.CharField(max_length=50)
    salary_max = models.CharField(max_length=50)
    priority_percentage = models.CharField(max_length=50)

class Highlight(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='highlights')
    point = models.TextField()
    is_bullet = models.BooleanField(default=True)

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='curriculum')
    title = models.CharField(max_length=200)
    description = models.TextField()

class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)

class ExampleModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)