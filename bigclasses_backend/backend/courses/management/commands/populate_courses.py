from django.core.management.base import BaseCommand
from courses.models import Course

class Command(BaseCommand):
    help = "Populate the database with sample courses"

    def handle(self, *args, **kwargs):
        courses = [
            {
                "title": "Python Programming",
                "slug": "python-programming",
                "description": "Learn the core concepts and algorithms behind machine learning with hands-on projects.",
                "image": "https://math.duke.edu/sites/math.duke.edu/files/styles/large/public/images/Featured%20Courses%20MTH%20260%20Python%20Programming%20in%20Math%20image.jpg.png?itok=kTIwZdBL",
                "students_enrolled": 2345,
                "duration": "8 weeks",
                "level": "Beginner",
                "rating": 4.9,
                "modules_count": 12,
            },
            {
                "title": "Machine Learning",
                "slug": "machine-learning",
                "description": "Build solid foundations in machine learning with practical use cases and algorithms.",
                "image": "https://media.istockphoto.com/id/1387900612/photo/automation-data-analytic-with-robot-and-digital-visualization-for-big-data-scientist.jpg?s=612x612&w=0&k=20&c=50maOJU6CpVC55mYnUqtff2aiaJZ7KlmMn4jNhWD_eo=",
                "students_enrolled": 3100,
                "duration": "10 weeks",
                "level": "Intermediate",
                "rating": 4.8,
                "modules_count": 14,
            },
            {
                "title": "Deep Learning",
                "slug": "deep-learning",
                "description": "Explore neural networks, CNNs, RNNs, and advanced architectures like Transformers.",
                "image": "https://miro.medium.com/v2/resize:fit:1024/1*tWLecb8_qosGJNHFAF43qA.jpeg",
                "students_enrolled": 2850,
                "duration": "9 weeks",
                "level": "Intermediate",
                "rating": 4.7,
                "modules_count": 13,
            },
        ]

        for course_data in courses:
            Course.objects.update_or_create(
                slug=course_data["slug"], defaults=course_data
            )

        self.stdout.write(self.style.SUCCESS("Sample courses populated successfully!"))
