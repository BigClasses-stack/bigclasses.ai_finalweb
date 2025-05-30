from django.core.management.base import BaseCommand
from courses.models import Course, Overview, Highlight, Module, Topic
from django.db import transaction
from django.utils.text import slugify
import time

class Command(BaseCommand):
    help = 'Ensures test data exists'

    def create_overview(self, course, package, hike, transitions):
        return Overview.objects.create(
            course=course,
            average_package=f"₹{package}L",
            average_hike=f"{hike}%",
            transitions=f"{transitions}+",
            salary_min=f"{int(float(package)*0.6)}L",
            salary_avg=f"{package}L",
            salary_max=f"{int(float(package)*1.5)}L",
            priority_percentage=f"{90 + hash(course.title) % 8}%"
        )

    @transaction.atomic
    def handle(self, *args, **kwargs):
        try:
            self.stdout.write('Clearing existing data...')
            Course.objects.all().delete()

            courses_data = [
                {
                    'id': 1,
                    'title': "Python Programming",
                    'package': "12.5",
                    'hike': "150",
                    'transitions': "500",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Python Basics", "Core Python concepts", ["Variables", "Data Types", "Control Flow"]),
                        ("Advanced Python", "Advanced features", ["OOP", "Decorators", "Generators"]),
                        ("Machine Learning", "ML models overview", ["Regression", "Classification", "Clustering"]),
                        ("Data Analysis", "Working with data", ["NumPy", "Pandas", "DataFrames"]),
                        ("Web Development", "Building applications", ["Flask", "Django", "APIs"])
                    ]
                },
                {
                    'id': 2,
                    'title': "Machine Learning",
                    'package': "15.5",
                    'hike': "180",
                    'transitions': "600",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Feature Engineering", "Techniques for feature transformation", ["Normalization", "Encoding", "Feature Selection"]),
                        ("Model Evaluation", "Evaluating model performance", ["Accuracy", "Precision", "Recall"]),
                        ("Unsupervised Learning", "Exploring unsupervised algorithms", ["K-Means", "PCA", "Anomaly Detection"]),
                        ("Model Optimization", "Tuning models", ["Grid Search", "Random Search", "Cross Validation"]),
                        ("Deployment", "Deploying ML models", ["Flask", "FastAPI", "Docker"])
                    ]
                },
                {
                    'id': 3,
                    'title': "Deep Learning",
                    'package': "18.5",
                    'hike': "200",
                    'transitions': "400",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Neural Networks", "Basic concepts of neural networks", ["Perceptrons", "Backpropagation", "CNN"]),
                        ("Advanced DL", "Deep architectures", ["RNN", "LSTM", "Transformers"]),
                        ("Convolutional Networks", "CNNs in image processing", ["Filters", "Pooling", "Feature Maps"]),
                        ("Recurrent Networks", "Sequence-based models", ["RNN", "LSTM", "GRU"]),
                        ("Optimization & Training", "Improving model performance", ["SGD", "Adam", "Dropout"])
                    ]
                },
                {
                    'id': 4,
                    'title': "Natural Language Processing",
                    'package': "17",
                    'hike': "190",
                    'transitions': "350",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Text Preprocessing", "Cleaning and preparing text data", ["Tokenization", "Lemmatization", "Stopwords Removal"]),
                        ("Embeddings", "Converting text to vectors", ["Word2Vec", "GloVe", "BERT"]),
                        ("NER & POS", "Named Entity Recognition & POS tagging", ["SpaCy", "NLTK"]),
                        ("Sentiment Analysis", "Analyzing sentiments", ["Lexicon-based", "ML models", "Deep Learning"]),
                        ("Chatbots", "Building conversational bots", ["DialogFlow", "Rasa", "Custom Bots"])
                    ]
                },
                {
                    'id': 5,
                    'title': "Generative AI",
                    'package': "20",
                    'hike': "210",
                    'transitions': "300",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Text Generation", "Generating text with models like GPT", ["Beam Search", "Top-k Sampling", "Temperature"]),
                        ("Image Synthesis", "Creating images from text", ["DALL·E", "Stable Diffusion", "ControlNet"]),
                        ("Audio Generation", "Generating audio from text", ["Tacotron", "WaveNet", "TTS"]),
                        ("Reinforcement for GenAI", "Reinforcement learning in GenAI", ["RLHF", "Rewards", "Feedback Loops"]),
                        ("Fine-tuning Generators", "Improving generative models", ["LoRA", "DreamBooth", "PEFT"])
                    ]
                },
                {
                    'id': 6,
                    'title': "LangChain",
                    'package': "16",
                    'hike': "170",
                    'transitions': "320",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("LangChain Basics", "Foundations", ["Chains", "Agents", "Callbacks"]),
                        ("Advanced LangChain", "Use cases", ["QA Systems", "Chatbots", "Custom Tools"]),
                        ("Integration", "Working with APIs", ["REST APIs", "GraphQL", "Webhooks"]),
                        ("Data Management", "Storing and using data", ["SQL", "NoSQL", "Data pipelines"]),
                        ("Deployment", "Deploying LangChain systems", ["Docker", "Kubernetes", "CI/CD"])
                    ]
                },
                {
                    'id': 7,
                    'title': "LangGraph",
                    'package': "15",
                    'hike': "160",
                    'transitions': "290",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Intro to LangGraph", "Workflow principles", ["Nodes", "Edges", "Flow Execution"]),
                        ("Advanced LangGraph", "Real applications", ["Tooling", "Visualization", "Monitoring"]),
                        ("API Integration", "Connecting systems", ["REST", "GraphQL", "Webhooks"]),
                        ("Memory Management", "Handling data within LangGraph", ["State", "Persistence", "Snapshots"]),
                        ("Deployment", "Deployment strategies", ["Scaling", "Fault Tolerance", "CI/CD"])
                    ]
                },
                {
                    'id': 8,
                    'title': "MLOps",
                    'package': "19",
                    'hike': "210",
                    'transitions': "380",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Model Development", "Building and training models", ["Data Preprocessing", "Model Selection"]),
                        ("CI/CD for AI", "Automating workflows", ["CI Tools", "CD Pipelines", "Testing"]),
                        ("Model Monitoring", "Continuous model evaluation", ["MLflow", "Kubeflow", "Prometheus"]),
                        ("Model Deployment", "Bringing models into production", ["Docker", "Kubernetes", "Cloud"]),
                        ("Model Lifecycle", "Managing model lifecycle", ["Versioning", "Model Registries", "Rollback"])
                    ]
                },
                {
                    'id': 9,
                    'title': "LLMOps",
                    'package': "22",
                    'hike': "220",
                    'transitions': "410",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("LLM Basics", "Introduction to large language models", ["GPT-3", "T5", "BERT"]),
                        ("Fine-tuning", "Improving LLM performance", ["Transfer Learning", "Few-shot learning"]),
                        ("Scaling LLMs", "Scaling large models", ["Distributed Training", "Parallelism"]),
                        ("Inference Optimization", "Optimizing LLMs for inference", ["Latency Reduction", "Distillation"]),
                        ("Deployment", "Deploying LLMs in production", ["Cloud", "Edge", "On-prem"])
                    ]
                },
                {
                    'id': 10,
                    'title': "AI Agents",
                    'package': "24",
                    'hike': "230",
                    'transitions': "350",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Agent Architecture", "Building AI agents", ["Reactive", "Deliberative"]),
                        ("Agent Training", "Training intelligent agents", ["Reinforcement Learning", "Supervised"]),
                        ("Autonomous Systems", "Autonomous agents", ["Robotics", "Control Systems"]),
                        ("Multi-agent Systems", "Multiple agents working together", ["Coordination", "Communication"]),
                        ("Deployment", "Deploying AI agents", ["Cloud", "Edge", "Distributed"])
                    ]
                },
                {
                    'id': 11,
                    'title': "AI Ethics",
                    'package': "13",
                    'hike': "140",
                    'transitions': "450",
                    'highlights': [
                        "Fundamentals of IT & AI",
                        "Python for AI",
                        "Math & Stat for AI",
                        "Machine Learning",
                        "Deep Learning",
                        "AI Application & GEN AI"
                    ],
                    'features': [
                        "Cloud & DevOps for AI",
                        "Gen AI & AI Agents",
                        "Online & ClassRoom Real-Time training",
                        "Project & Task Based Learning",
                        "24/7 Learning Support with Dedicated Mentors",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
                        ("Ethical AI Design", "Designing ethical AI systems", ["Fairness", "Transparency", "Bias"]),
                        ("AI in Society", "Impact of AI on society", ["Privacy", "Social Good", "AI Governance"]),
                        ("AI Regulation", "Global regulation of AI", ["GDPR", "AI Act", "Policy"]),
                        ("AI and Human Rights", "Balancing AI with human rights", ["Justice", "Accountability"]),
                        ("AI and Bias", "Reducing bias in AI systems", ["Discrimination", "Equal Opportunity"])
                    ]
                }
            ]

            def get_level(course_id):
                if course_id == 1:
                    return "Beginner"
                elif course_id == 5:
                    return "Advanced"
                else:
                    return "Intermediate"

            for course_data in courses_data:
                course = Course.objects.create(
                    id=course_data['id'],
                    title=course_data['title'],
                    slug=f"{slugify(course_data['title'])}-{int(time.time())}",
                    description=f"Complete {course_data['title']} bootcamp with hands-on projects",
                    image="https://example.com/course-image.jpg",
                    students_enrolled=2000 + hash(course_data['title']) % 1000,
                    duration="8-12 weeks",
                    level=get_level(course_data['id']),
                    rating=4.5 + (hash(course_data['title']) % 5) / 10,
                    modules_count=len(course_data['modules'])
                )

                self.create_overview(
                    course=course,
                    package=course_data['package'],
                    hike=course_data['hike'],
                    transitions=course_data['transitions']
                )

                for point in course_data['highlights']:
                    Highlight.objects.create(course=course, point=point, is_bullet=True)
                for point in course_data['features']:
                    Highlight.objects.create(course=course, point=point, is_bullet=False)

                for module_title, module_desc, topics in course_data['modules']:
                    module = Module.objects.create(
                        course=course,
                        title=module_title,
                        description=module_desc
                    )
                    for topic in topics:
                        Topic.objects.create(module=module, title=topic)

            self.stdout.write(self.style.SUCCESS('Successfully created all test data'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test data: {str(e)}'))
            raise
