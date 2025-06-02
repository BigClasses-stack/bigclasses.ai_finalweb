from rest_framework import serializers
from .models import Course, Overview, Highlight, Module, Topic

class OverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overview
        fields = '__all__'

class HighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Highlight
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['title']

class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['title', 'description', 'topics']

class CourseDetailSerializer(serializers.ModelSerializer):
    highlights = serializers.SerializerMethodField()
    overview = serializers.SerializerMethodField()
    curriculum = ModuleSerializer(many=True, read_only=True)
    
    # Add curriculum file information
    curriculum_file_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'highlights', 'overview', 'curriculum', 'curriculum_file_info']

    def get_highlights(self, obj):
        try:
            return {
                "title": obj.title,
                "key_topics": [h.point for h in obj.highlights.filter(is_bullet=True)] or [],
                "features": [h.point for h in obj.highlights.filter(is_bullet=False)] or [],
                "students_enrolled": str(obj.students_enrolled),
                "rating": str(obj.rating),
                "duration": obj.duration,
                "image_url": obj.image or ""
            }
        except Exception as e:
            return {
                "title": obj.title,
                "key_topics": [],
                "features": [],
                "students_enrolled": "0",
                "rating": "0",
                "duration": "N/A",
                "image_url": ""
            }

    def get_overview(self, obj):
        try:
            overview = obj.overview
            return {
                "avg_package": overview.average_package,
                "avg_hike": overview.average_hike,
                "successful_transitions": overview.transitions,
                "salary_insights": {
                    "min": overview.salary_min,
                    "avg": overview.salary_avg,
                    "max": overview.salary_max
                },
                "manager_priority_percentage": overview.priority_percentage
            }
        except Exception:
            return {
                "avg_package": "N/A",
                "avg_hike": "N/A",
                "successful_transitions": "N/A",
                "salary_insights": {
                    "min": "N/A",
                    "avg": "N/A",
                    "max": "N/A"
                },
                "manager_priority_percentage": "N/A"
            }

    def get_curriculum_file_info(self, obj):
        """Add curriculum file information to the response"""
        try:
            if not obj.curriculum_file:
                return {
                    "has_file": False,
                    "file_name": None,
                    "file_extension": None,
                    "download_available": False
                }
            
            # Get file information using model methods
            file_name = obj.get_curriculum_filename()
            file_extension = obj.get_file_extension()
            
            return {
                "has_file": True,
                "file_name": file_name,
                "file_extension": file_extension,
                "download_available": True,
                "download_url": f"/api/courses/{obj.id}/download-curriculum/",
                "uploaded_at": obj.file_uploaded_at.isoformat() if obj.file_uploaded_at else None
            }
        except Exception as e:
            return {
                "has_file": False,
                "file_name": None,
                "file_extension": None,
                "download_available": False,
                "error": "Error retrieving file information"
            }

class CourseSerializer(serializers.ModelSerializer):
    # Optional: Add basic file info to list view as well
    has_curriculum_file = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'students_enrolled', 
                 'duration', 'level', 'rating', 'modules_count', 'has_curriculum_file']

    def get_has_curriculum_file(self, obj):
        """Simple indicator if course has curriculum file"""
        return obj.has_curriculum_file