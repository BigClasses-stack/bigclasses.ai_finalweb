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
    class Meta:
        model = Course
        fields = ['id', 'title', 'highlights', 'overview', 'curriculum']

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

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'students_enrolled', 
                 'duration', 'level', 'rating', 'modules_count']
