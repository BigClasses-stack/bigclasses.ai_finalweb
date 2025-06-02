from django.core.management.base import BaseCommand
from courses.models import Course, Overview, Highlight, Module, Topic
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Loads sample course data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        Course.objects.all().delete()

        courses_data = [
            {
                'title': "Python Programming",
                'description': "Learn Python from scratch",
                'image': "https://example.com/python.jpg",
                'students_enrolled': 2345,
                'duration': "8 weeks",
                'level': "Beginner",
                'rating': 4.9,
                'modules_count': 12,
                'overview': {
                    'average_package': "₹12.5L",
                    'average_hike': "150%",
                    'transitions': "500+",
                    'salary_min': "8L",
                    'salary_avg': "12.5L",
                    'salary_max': "25L",
                    'priority_percentage': "89%"
                },
                'highlights': [
                    "Learn Python fundamentals",
                    "Build real-world projects",
                    "Industry best practices"
                ],
                'modules': [
                    {
                        'title': "Python Basics",
                        'description': "Fundamental Python concepts",
                        'topics': ["Variables", "Data Types", "Control Flow"]
                    },
                    {
                        'title': "Advanced Python",
                        'description': "Advanced Python features",
                        'topics': ["OOP", "Decorators", "Generators"]
                    }
                ]
            },
        ]

        for course_data in courses_data:
            try:
                course = Course.objects.create(
                    title=course_data['title'],
                    slug=slugify(course_data['title']),
                    description=course_data['description'],
                    image=course_data['image'],
                    students_enrolled=course_data['students_enrolled'],
                    duration=course_data['duration'],
                    level=course_data['level'],
                    rating=course_data['rating'],
                    modules_count=course_data['modules_count']
                )

                Overview.objects.create(
                    course=course,
                    **course_data['overview']
                )

                for point in course_data['highlights']:
                    Highlight.objects.create(
                        course=course,
                        point=point,
                        is_bullet=True
                    )

                for module_data in course_data['modules']:
                    module = Module.objects.create(
                        course=course,
                        title=module_data['title'],
                        description=module_data['description']
                    )
                    
                    for topic_title in module_data['topics']:
                        Topic.objects.create(
                            module=module,
                            title=topic_title
                        )

                self.stdout.write(self.style.SUCCESS(f'Successfully created course: {course.title}'))

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create course {course_data["title"]}: {str(e)}')
                )

        self.stdout.write(self.style.SUCCESS('Sample data loading completed'))
