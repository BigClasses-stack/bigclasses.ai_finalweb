from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import time
import os

def validate_curriculum_file(value):
    """Validate uploaded curriculum file"""
    # Optional: Check file size (e.g., max 50MB for any file type)
    if value.size > 50 * 1024 * 1024:  # 50MB
        raise ValidationError('File size cannot exceed 50MB.')
    
    # Optional: Restrict certain dangerous file types
    dangerous_extensions = ['.exe', '.bat', '.cmd', '.scr', '.pif']
    file_extension = os.path.splitext(value.name.lower())[1]
    if file_extension in dangerous_extensions:
        raise ValidationError('This file type is not allowed for security reasons.')

def curriculum_file_path(instance, filename):
    """Generate upload path for curriculum files"""
    # Clean filename and preserve original extension
    name, ext = os.path.splitext(filename)
    clean_name = slugify(name)
    timestamp = int(time.time())
    
    return f'curriculum_files/{instance.slug}/{clean_name}_{timestamp}{ext}'

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
    
    # New field for curriculum file (any type)
    curriculum_file = models.FileField(
        upload_to=curriculum_file_path,
        validators=[validate_curriculum_file],
        blank=True,
        null=True,
        help_text="Upload curriculum file (PDF, DOC, PPT, etc. - max 50MB)"
    )
    
    # Optional: Track when file was uploaded
    file_uploaded_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            timestamp = int(time.time())
            self.slug = f"{slugify(self.title)}-{timestamp}"
        
        # Update file uploaded timestamp if file is being added/changed
        if self.curriculum_file and not self.file_uploaded_at:
            self.file_uploaded_at = timezone.now()
        elif not self.curriculum_file:
            self.file_uploaded_at = None
            
        super().save(*args, **kwargs)

    @property
    def has_curriculum_file(self):
        """Check if course has a curriculum file"""
        return bool(self.curriculum_file)

    def get_curriculum_filename(self):
        """Get the original filename for download"""
        if self.curriculum_file:
            original_name = os.path.basename(self.curriculum_file.name)
            name, ext = os.path.splitext(original_name)
            return f"{self.title}_Curriculum{ext}"
        return None
    
    def get_file_extension(self):
        """Get file extension for frontend handling"""
        if self.curriculum_file:
            return os.path.splitext(self.curriculum_file.name)[1].lower()
        return None

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