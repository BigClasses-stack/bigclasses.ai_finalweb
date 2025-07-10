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
                    'image': "https://grras.com/files/hiclvxrtdz6derhkzc6a/python%20(1).png",


                    'highlights': [
                        "Basics of Python Programming",
                        "Data Structures and Algorithms",
                        "Object-Oriented Programming (OOP)",
                        "File Handling and Exceptions",
                        "Advanced Python"
                   ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
                        ("Basics of Python Programming", "Basic Python covers variables, data types, loops, functions, and I/O.", ["Python Syntax and Variables", "Data Types and Operators", "Conditional Statements and Loops","Project : Create a basic calculator with conditional operations."]),
                        ("Data Structures and Algorithms", "DSA focuses on efficient data storage and problem-solving methods.", ["Lists, Tuples, and Dictionaries", "Stack, Queue, and Tree Implementations", "Sorting and Searching Algorithms","Project :Develop a to-do list application with priority sorting."]),
                        ("Object-Oriented Programming (OOP)", "OOP is a programming style based on classes and objects.", ["Classes and Objects","Polymorphism and Inheritance", "Encapsulation", "Project :Create a library management system using OOP principles."]),
                        ("File Handling and Exceptions", "File handling manages data files; exceptions handle runtime errors.", ["Reading and Writing Files", "Exception Handling", "Logging and Debugging","Project : Build a file organizer that categorizes files into folders based on type."]),
                        ("Advanced Python", "Advanced Python includes decorators, generators, and context managers.", ["Python Modules and Packages", "Decorators and Generators", "Multithreading and Multiprocessing","Project :Design a multithreaded web scraper for extracting headlines."])
                    ]
                },
                {
                    'id': 2,
                    'title': "Machine Learning",
                    'package': "15.5",
                    'hike': "180",
                    'transitions': "600",
                    'image': "https://www.digitaledify.ai/images/aibnr.jpg",  # <-- Add this line

                    'highlights': [
                        "Introduction to Machine Learning",
                        "Supervised Learning",
                        "Unsupervised Learning",
                        "Model Evaluation and Optimization",
                        "Deployment"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
                        ("Introduction to Machine Learning", "Getting started with algorithms that enable data-driven predictions.", ["Supervised vs. Unsupervised Learning", "Machine Learning Lifecycle", "Data Preprocessing", "Project : Implement a simple house price prediction model."]),
                        ("Supervised Learning", "Learning from labeled data to predict outcomes.", ["Linear and Logistic Regression","Decision Trees and Random Forests", "Gradient Boosting (XGBoost, LightGBM)", "Project : Develop a spam email detection system."]),
                        ("Unsupervised Learning", "Identifying patterns in unlabeled data.", ["K-Means Clustering","Hierarchical Clustering","Dimensionality Reduction (PCA)","Project : Create a customer segmentation model for a retail store."]),
                        ("Model Evaluation and Optimization", "Enhancing model performance through evaluation and fine-tuning.", ["Cross-Validation and Hyperparameter Tuning","Confusion Matrix and AUC-ROC","Overfitting and Regularization Techniques","Project : Optimize a model to predict employee attrition rates."]),
                        ("Deployment", "Delivering models for real-world use.", ["Flask/FastAPI for ML Model Deployment", "Monitoring and Updating Models", "Deployment on Cloud Platforms (AWS/GCP)", "Project : Deploy a loan approval prediction model on a cloud platform."])
                    ]

                },
                {
                    'id': 3,
                    'title': "Deep Learning",
                    'package': "18.5",
                    'hike': "200",
                    'transitions': "400",
                    'image': "https://public.softmaxdata.com/imgs/home/data_discussion.png",  # <-- Add this line

                    'highlights': [
                        "Basics of Neural Networks",
                        "Convolutional Neural Networks (CNNs)",
                        "Recurrent Neural Networks (RNNs)",
                        "Transformers",
                        "Deployment and Real-World Applications"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Basics of Neural Networks",
        "Basics of neural networks cover layers, neurons, and learning processes.",
        [
            "Perceptrons and Activation Functions",
            "Forward and Backward Propagation",
            "Loss Functions",
            "Project : Build a simple neural network for digit classification (MNIST)."


        ]
    ),
    (
        "Convolutional Neural Networks (CNNs)",
        "CNNs are neural networks specialized for image processing tasks.",
        [
            "Convolution and Pooling Operations",
            "Transfer Learning with Pretrained Models",
            "Applications in Image Recognition",
            "Project : Create a face detection system using CNNs."


        ]
    ),
    (
        "Recurrent Neural Networks (RNNs)",
        "RNNs are neural networks designed for sequential data and time series.",
        [
            "LSTMs and GRUs",
            "Applications in Text and Time-Series Data",
            "Attention Mechanism Basics",
            "Project :Build a text sentiment analysis tool using RNNs."


        ]
    ),
    (
        "Transformers",
        "Transformers are models that use attention to process sequence data efficiently.",
        [
            "Introduction to Transformers and BERT",
            "Sequence-to-Sequence Models",
            "Applications in NLP",
            "Project :Develop a text summarization tool using BERT."


        ]
    ),
    (
        "Deployment and Real-World Applications",
        "Deployment and real-world applications involve launching models for practical use.",
        [
            "Model Deployment with TensorFlow Serving",
            "Real-Time Analytics with Deep Learning",
            "Industry Case Studies",
            "Project : Deploy an image recognition model on a cloud platform"
        ]
    )
]
                },
                {
                    'id': 4,
                    'title': "Natural Language Processing",
                    'package': "17",
                    'hike': "190",
                    'transitions': "350",
                    'image': "https://cdn.prod.website-files.com/634054bf0f60201ce9b30604/6489540e67c5fbe5900c09cf_home%20large%20down.svg",  # <-- Add this line

                    'highlights': [
                        "Text Preprocessing",
                        "Classical NLP Approaches",
                        "Advanced NLP Techniques",
                        "Applications of NLP",
                        "Deployment and Integration"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Text Preprocessing",
        "Preparing text data for analysis and modeling.",
        [
            "Tokenization and Stopword Removal",
            "Lemmatization and Stemming",
            "N-Grams and Bag of Words",
            "Project : Develop a keyword extractor from text documents."
        ]
    ),
    (
        "Classical NLP Approaches",
        "Traditional methods for text analysis using statistical and rule-based techniques.",
        [
            "Sentiment Analysis",
            "Named Entity Recognition (NER)",
            "Text Classification",
            "Project : Build a sentiment analysis model for product reviews."


        ]
    ),
    (
        "Advanced NLP Techniques",
        "Cutting-edge methods like transformers for deep text understanding.",
        [
            "Word Embeddings (Word2Vec, GloVe)",
            "Transformers (BERT, GPT)",
            "Sequence-to-Sequence Models",
            "Project : Create a machine translation system."


        ]
    ),
    (
        "Applications of NLP",
        "Real-world uses of NLP, including chatbots, sentiment analysis, and translation.",
        [
            "Chatbots and Virtual Assistants",
            "Text Summarization",
            "Topic Modeling",
            "Project : Develop a chatbot for customer support."


        ]
    ),
    (
        "Deployment and Integration",
        "Implementing models into systems for seamless real-world use.",
        [
            "Deployment of NLP Models",
            "Integration with Web Applications",
            "NLP in Real-Time Systems",
            "Project : Deploy a language detection model for a multilingual website"
        ]
    )
]

                },
                {
                    'id': 5,
                    'title': "Generative AI",
                    'package': "20",
                    'hike': "210",
                    'transitions': "300",
                    'image': "https://img.freepik.com/premium-photo/abstract-ai-illustration-with-futuristic-design-elements-vibrant-colors-showcasing-artificial-intelligence-digital-connectivity_124865-93745.jpg",  # <-- Add this line

                    'highlights': [
                        "Fundamentals of Generative AI",
                        "Text Generation",
                        "Image and Video Generation",
                        "Multi-Modal Models",
                        "Real-World Applications and Deployment",

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Fundamentals of Generative AI",
        "Exploring models like GANs, VAEs, and Diffusion for generative tasks.",
        [
            "Introduction to GANs",
            "Variational Autoencoders (VAEs)",
            "Diffusion Models",
            "Project : Build a basic GAN for image generation."
        ]
    ),
    (
        "Text Generation",
        "Text generation is creating written content using AI models.",
        [
            "GPT Models and Their Applications",
            "Fine-Tuning Pretrained Models",
            "Text-Based Content Creation",
            "Project : Develop an AI writer for automated blog generation."
        ]
    ),
    (
        "Image and Video Generation",
        "Image and video generation use AI to create visual content.",
        [
            "DALL-E and Stable Diffusion",
            "GANs for Image-to-Image Translation",
            "Applications in Video Synthesis",
            "Project: Create an AI-powered image-to-art converter."
        ]
    ),
    (
        "Multi-Modal Models",
        "Multi-modal models process and combine different data types like text and images.",
        [
            "Combining Text, Image, and Audio Data",
            "CLIP and Other Multi-Modal Models",
            "Use Cases in Interactive Media",
            "Project : Develop a multi-modal system that generates captions for images."
        ]
    ),
    (
        "Real-World Applications and Deployment",
        "Real-world applications and deployment bring AI models into practical use.",
        [
            "Deployment of Generative AI Models",
            "Ethical Considerations in Generative AI",
            "Industry Applications",
            "Project : Deploy a generative AI model for creating virtual environments"
        ]
    )
]
                },
                {
                    'id': 6,
                    'title': "LangChain",
                    'package': "16",
                    'hike': "170",
                    'transitions': "320",
                    'image': "https://cdn.prod.website-files.com/62a8969da1ab56329dc8c41e/664eeed26a136d6160434321_Amazon_Lamd-03%201.png",  # <-- Add this line

                    'highlights': [
                        "Introduction to LangChain",
                        "Working with Language Models",
                        "Building Knowledge-Based Systems",
                        "Deployment and Scaling",
                        "Advanced Features of LangChain"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Introduction to LangChain",
        "Overview of LangChain for building language model-powered applications.",
        [
            "Overview of LangChain",
            "Core Concepts: Chains and Agents",
            "Setting Up LangChain Environment",
            "Project : Build a simple conversational chain using LangChain."
        ]
    ),
    (
        "Working with Language Models",
        "Using language models to generate, understand, and analyze text.",
        [
            "Integrating OpenAI APIs (GPT, BERT)",
            "Fine-Tuning LLMs",
            "Prompt Engineering Techniques",
            "Project : Create a question-answering system using GPT."
        ]
    ),
    (
        "Building Knowledge-Based Systems",
        "Developing intelligent systems using structured data and rules.",
        [
            "Workflow Automation with Chains",
            "Memory Management in LangChain",
            "Developing Custom Agents",
            "Project : Build a workflow automation tool with LangChain agents."
        ]
    ),
    (
        "Deployment and Scaling",
        "Launching applications and expanding capacity to handle growth.",
        [
            "Deployment of LangChain Applications",
            "Monitoring and Optimization of Chains",
            "Scaling for High-Volume Requests",
            "Project : Deploy a customer support system powered by LangChain."
        ]
    ),
    (
        "Advanced Features of LangChain",
        "Creating systems that leverage structured information for intelligent responses.",
        [
            "Utilizing External Data Sources",
            "Building a Context-Aware Chatbot",
            "Semantic Search and Retrieval-Augmented Generation (RAG)",
            "Project: Develop a chatbot for FAQ retrieval"
        ]
    )
]

                },
                {
                    'id': 7,
                    'title': "LangGraph",
                    'package': "15",
                    'hike': "160",
                    'transitions': "290",
                    'image': "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*GuAKET2lI82IcBrW.png",  # <-- Add this line

                    'highlights': [
                        "Fundamentals of LangGraph",
                        "Advanced Graph-Based Workflows",
                        "Integration with External Services",
                        "Complex Graph Applications",
                        "Deployment and Monitoring",

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Fundamentals of LangGraph",
        "LangGraph fundamentals cover building and managing AI workflows with graph-based structures.",
        [
            "Introduction to LangGraph",
            "Creating Graph-Based Workflows",
            "Data Modeling in LangGraph",
            "Project : Build a simple graph for task prioritization."
        ]
    ),
    (
        "Advanced Graph-Based Workflows",
        "Advanced Graph-Based Workflows.",
        [
            "Creating Custom Nodes and Edges",
            "Optimizing Workflow Execution",
            "Handling Errors in LangGraph Workflows",
            "Project : Develop a document approval workflow."
        ]
    ),
    (
        "Integration with External Services",
        "Integration with external services connects AI workflows to APIs and third-party tools.",
        [
            "Connecting APIs and Databases",
            "Dynamic Updates in Graphs",
            "Real-Time Graph Visualization",
            "Project : Build a real-time data processing pipeline using LangGraph."
        ]
    ),
    (
        "Complex Graph Applications",
        "Complex graph applications solve intricate problems using advanced graph structures.",
        [
            "Multi-Step Graph Workflows",
            "Recursive Workflows and Loops",
            "Parallel Processing in LangGraph",
            "Project : Create a knowledge graph for content recommendation."
        ]
    ),
    (
        "Deployment and Monitoring",
        "Deployment and monitoring ensure AI models run smoothly and perform well in production.",
        [
            "Deploying LangGraph Applications",
            "Performance Monitoring and Debugging",
            "Scaling Graph-Based Solutions",
            "Project: Deploy a graph-based project management system"
        ]
    )
]

                },
                {
                    'id': 8,
                    'title': "MLOps",
                    'package': "19",
                    'hike': "210",
                    'transitions': "380",
                    'image': "https://miro.medium.com/v2/resize:fit:800/1*0DmXy4etGIxtI9nbYqMBAw.png",  # <-- Add this line

                    'highlights': [
                        "Introduction to MLOps",
                        "Introduction to MLflow",
                        "MLflow Tracking component",
                        "MLflow Logging function",
                        "Launch multiple Experiments and Runs",
                        "Autologging in MLflow",
                        "Tracking Server of MLflow",
                        "MLflow Model component",
                        "Handling Customized models in MLflow",
                        "MLflow Model Evaluation",
                        "Git and Github",
                        "Docker",
                        "Kubernetes",
                        "Terraform",
                        "Azure Essentials",
                        "Azure MLops"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Introduction to MLOps",
        "Introduction to MLOps covers the basics of deploying and managing machine learning models efficiently.",
        [
            "What is MLOps?",
            "Traditional Machine Learning Lifecycle",
            "Challenges in traditional ML lifecycle - Part 1",
            "Challenges in traditional ML lifecycle - Part 2",
            "How MLOps address the challenges"
        ]
    ),
    (
        "Introduction to MLFlow",
        "Getting started with MLflow for tracking and managing ML experiments.",
        [
            "What is MLFlow",
            "Components of MLFlow",
            "MLflow Setup"
        ]
    ),
    (
        "MLflow Tracking Components",
        "MLflow Tracking lets you log and manage experiments with APIs, a central server, metadata store, and artifact storage.",
        [
            "Sklearn regression model",
            "Sklearn regression model with MLflow",
            "MLruns directory",
            "MLflow UI tour"
        ]
    ),
    (
        "MLflow Logging Functions",
        "MLflow logging functions record experiment data like parameters, metrics, tags, and artifacts during model training.",
        [
            "Setting and Getting Tracking Uri - Part 1",
            "Setting and Getting Tracking Uri - Part 2",
            "Create MLflow experiment function",
            "Set MLflow experiment function",
            "Start and End run functions - Part 1",
            "Start and End run functions - Part 2",
            "Active & Last active run functions",
            "Log multiple parameters & metrics function",
            "Log multiple artifacts function",
            "Set tags function"
            ]
    ),
    (
        "Launch Multiple Experiments and Runs",
        "MLflow allows launching multiple experiments and runs to track and compare different model training workflows.",
        [
            "Launch multiple Runs in a program",
            "Launch multiple Experiments in a program"
        ]
    ),
    (
        "Autologging in MLflow",
        "MLflow autologging automatically logs parameters, metrics, and artifacts during training.",
        [
            "Introduction to Autologging",
            "implement autolog() function",
            "Implement library specific autolog function"
        ]
    ),
    (
        "Tracking Server of MLflow",
        "The MLflow Tracking Server stores and manages experiment runs, parameters, metrics, and artifacts centrally.",
        [
            "What is MLflow Tracking server",
            "Implement Tracking Server in MLflow",
            "Local Tracking server scenarios",
            "Remote Tracking server scenarios"
        ]
    ),
    (
        "MLflow Model Component",
        "The MLflow Model component packages machine learning models for easy deployment and reuse across platforms.",
        [
            "Introduction to Model component",
            "Model components",
            "Storage format",
            "MLmodel file explained",
            "What are Model Signatures",
            "What is Signature Enforcement in MLflow",
            "Log Signatures & input example in MLflow",
            "Model API (save_model, log_model) explained"
        ]
    ),
    (
        "Handling Customized Models in MLflow",
        "MLflow handles custom models by packaging and logging them with their code and dependencies.",
        [
            "What is Model customization in MLflow",
            "Implement Custom Python model - Part 1",
            "Implement Custom Python model - Part 2",
            "Implement Custom Python model - Part 3",
            "Loading the customized Python model",
            "Custom Flavors in MLflow"
        ]
    ),
    (
        "MLflow Model Evaluation",
        "MLflow Model Evaluation tracks and compares model performance using logged metrics and visualizations.",
        [
            "Introduction to Model evaluation in MLflow",
            "Evaluate function parameters",
            "Implement evaluate() function",
            "Comparing Runs of an Experiment",
            "Create Custome metrics and artifacts",
            "Setting Validation thresholds in evaluate()"

        ]
    ),
    (
        "Git and GitHub",
        "Git and GitHub enable efficient version control and collaboration for software development projects.",
        [
            "Introduction to Git and GitHub",
            "Basic Git Commands",
            "Working with Remote Repositories",
            "Git Ignore and Managing Sensitive Files",
            "Collaboration using Pull Requests",
            "Resolving Merge Conflicts",
            "Advanced Git Operations",
            "GitHub Actions and Automation"

        ]
    ),
    (
        "Docker",
        "Docker simplifies application deployment by containerizing applications and their dependencies for portability and scalability.",
        [
            "Introduction to Docker and Containerization",
            "Installing and Setting Up Docker",
            "Docker Images and Containers",
            "Creating Custom Docker Images with Dockerfile",
            "Working with Docker Hub",
            "Docker Compose Basics",
            "Networking in Docker",
            "Docker Volumes and Data Persistence",
            "Managing and Monitoring Docker Containers"

        ]
    ),
    (
        "Kubernetes",
        "Kubernetes orchestrates containerized applications, providing scalability, availability, and manageability.",
        [
            "Introduction to Kubernetes and Container Orchestration",
            "Setting Up a Kubernetes Cluster",
            "Understanding Pods and Deployments",
            "Kubernetes Services and Networking",
            "Managing Configuration with ConfigMaps and Secrets",
            "Persistent Storage in Kubernetes",
            "Scaling and Autoscaling Applications",
            "Kubernetes Ingress and Load Balancing",
            "Monitoring and Logging in Kubernetes"

        ]
    ),
    (
        "Terraform",
        "Terraform enables Infrastructure as Code (IaC), allowing declarative provisioning and management of cloud infrastructure.",
        [
            "Introduction to Infrastructure as Code and Terraform",
            "Setting Up Terraform and Providers",
            "Writing and Organizing Terraform Configuration Files",
            "Managing Resources with Terraform",
            "Variables, Outputs, and Sensitive Data",
            "Terraform State and Remote Backends",
            "Terraform Modules for Reusable Configurations",
            "Conditional Logic and Dynamic Blocks",
            "Provisioners and Resource Dependencies"

        ]
    ),
    (
        "Azure Essentials",
        "Introduction to Azure cloud platform.",
        [
            "Introduction to Azure and Cloud Computing",
            "Azure Computing Services",
            "Azure Networking Services",
            "Azure Storage Services",
            "Azure Database Services",
            "Azure Security Services",
            "Azure Monitoring and Management Services",
            "Azure DevOps"
        ]
    )
]

                },
                {
                    'id': 9,
                    'title': "LLMOps",
                    'package': "22",
                    'hike': "220",
                    'transitions': "410",
                    'image': "https://littlebigcode.fr/wp-content/uploads/2022/02/image-20211203-161343.png",  # <-- Add this line

                    'highlights': [
                        "Basics of LLMOps",
                        "Data Management for LLMs",
                        "Model Training and Optimization",
                        "Deployment and Monitoring",
                        "Advanced MLOps Practices"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Basics of LLMOps",
        "Managing and optimizing workflows for large language models.",
        [
            "Understanding LLM Workflows",
            "Setting Up LLM Pipelines",
            "Fine-Tuning vs Prompt Engineering",
            "Project :Build a text summarization pipeline with LLMs."
        ]
    ),
    (
        "Data Management for LLMs",
        "Data management for LLMs involves organizing and processing data for effective model training and updates.",
        [
            "Preprocessing Text Data for LLMs",
            "Dataset Versioning and Tokenization",
            "Handling Large Text Corpora",
            "Project : Create a preprocessing pipeline for a sentiment dataset."


        ]
    ),
    (
        "Model Training and Optimization",
        "Model training and optimization focus on improving AI performance through data and tuning.",
        [
            "Fine-Tuning Large Models",
            "Parameter Optimization Techniques",
            "Distributed Training for LLMs",
            "Project : Fine-tune a BERT model for a classification task."
        ]
    ),
    (
        "Deployment and Monitoring",
        "Deployment and monitoring ensure AI models run reliably and stay effective over time.",
        [
            "Model Deployment (Docker, Kubernetes)",
            "Monitoring Models in Production",
            "Handling Model Drift",
            "Project : Deploy and monitor a churn prediction model in production."
        ]
    ),
    (
        "Advanced MLOps Practices",
        "Advanced MLOps practices automate, scale, and secure AI workflows for production.",
        [
            "Continuous Monitoring and Feedback Loops",
            "Scaling MLOps Pipelines",
            "Case Studies of MLOps in Industry",
            "Project : Implement an end-to-end MLOps pipeline for a retail use case."

        ]
    )
]

                },
                {
                    'id': 10,
                    'title': "AI Agents",
                    'package': "24",
                    'hike': "230",
                    'transitions': "350",
                    'image': "https://miro.medium.com/v2/resize:fit:1400/0*P8FHyPOLd8mpNHY8",  # <-- Add this line

                    'highlights': [
                        "Basics of Agents",
                        "Reinforcement Learning for Agents",
                        "Multi-Agent Systems",
                        "Autonomous Decision-Making",
                        "Agent Deployment"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"
                    ],
                    'modules': [
    (
        "Basics of Agents",
        "Understanding autonomous programs that perform tasks independently.",
        [
            "Introduction to AI Agents",
            "Rule-Based vs Learning-Based Agents",
            "Setting Up Simple AI Agents",
            "Project : Build a basic rule-based agent for a game."
        ]
    ),
    (
        "Reinforcement Learning for Agents",
        "Training agents to learn optimal actions through rewards and feedback.",
        [
            "Q-Learning and SARSA Algorithms",
            "Deep Q-Networks (DQN)",
            "Policy Gradient Methods",
            "Project : Create an agent to play a simple grid-based game."
        ]
    ),
    (
        "Multi-Agent Systems",
        "Coordinating multiple agents to solve complex tasks collaboratively.",
        [
            "Communication in Multi-Agent Systems",
            "Coordination and Conflict Resolution",
            "Applications of Multi-Agent Systems",
            "Project : Build a multi-agent system for resource allocation."
        ]
    ),
    (
        "Autonomous Decision-Making",
        "Enabling systems to make choices without human intervention.",
        [
            "Planning and Scheduling for Agents",
            "Probabilistic Models in Decision-Making",
            "Game-Theoretic Approaches",
            "Project : Develop an agent for automated task scheduling."
        ]
    ),
    (
        "Agent Deployment",
        "Launching and managing agents in real-world environments.",
        [
            "Deploying Agents in Real-World Applications",
            "Monitoring Agent Behavior",
            "Ethical Considerations in Autonomous Agents",
            "Project : Deploy an agent for inventory management in a warehouse."

        ]
    )
]

                },
                {
                    'id': 11,
                    'title': "AI Ethics",
                    'package': "13",
                    'hike': "140",
                    'transitions': "450",
                    'image': "https://aicontentfy.com/hubfs/Blog/Robot%20with%20a%20toolbox%20in%20flat%20illustration%20style%20with%20gradients%20and%20white%20background_a1a8948e-7a01-4f70-86f6-791a47ffe3e5.png",  # <-- Add this line

                    'highlights': [
                        "Introduction to AI Ethics",
                        "Responsible AI Development",
                        "Scaling AI Systems",
                        "AI in High-Stakes Applications",
                        "Future of Ethical AI"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Introduction to AI Ethics",
        "Exploring moral principles guiding responsible AI development and use.",
        [
            "Key Ethical Principles",
            "Bias and Fairness in AI Systems",
            "Privacy and Data Protection",
            "Project : Analyze a biased dataset and propose improvements."
        ]
    ),
    (
        "Responsible AI Development",
        "Building AI systems that are fair, transparent, and accountable.",
        [
            "Transparent AI Models",
            "Ethical AI Governance",
            "Tools for Ethical AI Development",
            "Project : Build a transparent ML model with explainability features."
        ]
    ),
    (
        "Scaling AI Systems",
        "Expanding AI capabilities to handle larger data and users efficiently.",
        [
            "Distributed Training and Model Parallelism",
            "Load Balancing for AI Workloads",
            "Optimizing Resource Usage",
            "Project : Scale a deep learning model for real-time inference."
        ]
    ),
    (
        "AI in High-Stakes Applications",
        "Applying AI responsibly in critical areas like healthcare and finance.",
        [
            "AI in Healthcare, Finance, and Law",
            "Ethical Challenges in Critical Domains",
            "Case Studies of AI Failures",
            "Project : Propose an ethical framework for deploying AI in healthcare."
        ]
    ),
    (
        "Future of Ethical AI",
        "Advancing AI with fairness, transparency, and societal benefit in mind.",
        [
            "AI Policy and Regulation Trends",
            "AI for Social Good",
            "Long-Term Implications of AI Systems",
            "Project : Create a roadmap for implementing AI ethics in an organization."
        ]
    )
]

                },
            {
                    'id': 12,
                    'title': "Data-analytics",
                    'package': "13",
                    'hike': "140",
                    'transitions': "450",
                    'image': "https://www.shutterstock.com/image-vector/thin-line-flat-design-business-600nw-300116720.jpg",  # <-- Add this line

                    'highlights': [
                        "Excel with Project",
                        
                        "SQL Server with Project",
                        "PowerBI with Project",
                        "Python with Project",
                        "Git and Github",
                        "Interview Preparation"

                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
                    'modules': [
    (
        "Excel with Project",
        "Learn the fundamentals of Microsoft Excel through hands-on projects, mastering data organization, formulas, charts, and essential tools for real-world tasks.",
        [
            "Introduction to Excel",
            "Personalizing Excel",
            "Lookup and Referencing",
            "Arithmetic Functions",
            "Text Functions",
            "Data Cleaning Functions",
            "Mathematical Functions",
            "General Formatting",
            "Conditional Formatting",
            "Database Functions",
            "Text and Data Manipulation",
            "Protecting Excel - Excel Security",
            "Printing Workbooks",
            "Advance Paste Special Techniques",
            "Date, Time, Financial,& Statistical Functions",
            "Error Handling, Filtering and Sorting",
            "Advanced Excel Functions",
            "What if Analysis and Data Validation",
            "Logical Analysis, Array & Lookup Functions",
            "Pivot Tables, Slicers & Charts, Addins & Dashboards"
        ]
    ),
    (
        "SQL Server with Project",
        "Learn the fundamentals of SQL Server through hands-on projects, covering database design, queries, and performance optimization.",
        [
            "Introduction to Data & Database Systems",
            "Complete Introduction to SQL Server",
            "SQL Server Software installation",
            "SSMS Window",
            "Datatypes & Sub- Languages in SQL",
            "Renaming & Copying Data",
            "Arithmetic, Comparision, Logical, Set & Special Operators, Schemas",
            "Functions, Special Clauses, Ranking Functions",
            "Constraints, Joins, Views, Synonyms, Indexes & Sub Queries",
            "TCL Commands, CTE, Duplicates, Normalization",
            "ER Modelling, Relationships, OLTPS, Temporary Tables",
            "TSQL, Variables, Control Statements, Cursors, Stored Procedures, Stored Functions",
            "Triggers"
        ]
    ),
    (
        "PowerBI with Project",
        "Gain hands-on experience in data analysis and visualization by learning Power BI tools and techniques through a practical, real-world project.",
        [
            "Power BI Complete Introduction",
            "PowerBI Desktop installation & PowerBI Service",
            "PowerBI Desktop User Interface",
            "Building Blocks of PowerBI",
            "Power Query (Transformation, Merge, Append)",
            "Power Pivot (Data Modelling, DAX, Quick Measures)",
            "Power View (Report View, Visual Interaction, Filters, Hierarchy, Visualizations",
            "Grouping, Binning, Sorting, Tooltip Page & Bookmarks",
            "PowerBI Service (Datasets, Dashboards, Data Connectivity modes, Gateways)",
            "Understanding Sub Folder in Workspace",
            "Dataflows, Dataset actions, Excel Workbooks, Report & Dashboard actions",
            "Row Level Security, Deployment Pipelines, ADD ONs"
        ]
    ),
    (
        "Python with Project",
        "Learn Python fundamentals through hands-on coding and build a complete project to apply your skills in a real-world context.",
        [
            "Python Basics",
            "Core Python (Conditional & Iterative Statements, Data Structures, Functions & Modules)",
            "Exception Handling, Regular Expressions, Exporting Data to .txt Files",
            "Object Oriented Programming",
            "Python for Data Analytics",
            "Using Pandas Library (Data Structures, Data import & export)",
            "Using Matplotlib Library (NumPy, Database Connections)"
        ]
    ),
    (
        "Interview Preparation",
        "This module provides essential strategies and practical skills to help you confidently prepare for and succeed in job interviews.",
        [
            "Basic Self introduction",
            "Interview Skills (Preparation, Post Interview)",
            "Personal Branding",
            "Mock Interviews"
        ]
    )
]

                },
        {
                    'id': 13,
                    'title': "Azure Data Engineering",
                    'package': "12",
                    'hike': "150",
                    'transitions': "500",
                    'image': "https://www.nextitcareer.com/wp-content/uploads/2023/11/azure-data-engineer-course.jpg",  # <-- Add this line

                    'highlights': [
                        "Azure SQL",
                        "Azure DataLake",
                        "Azure Synapse Analytics",
                        "Azure Data Factory",
                        "Azure Data Bricks",
                        "Azure Cosmos DB",
                        "Azure Stream Analytics",
                        "Azure Key Vault"


                    ],
                    'features': [
                        "Real-Time Applications",
                        "Capstone Projects",
                        "Online & Classroom Real-time Training",
                        "Project & Task-Based Learning",
                        "24/7 Learning Support",
                        "Interviews, Jobs and Placement Support"

                    ],
'modules': [
    (
        "Azure SQL",
        "Master Azure SQL for creating, managing, and querying relational databases in the cloud.",
        [
            "Introduction to Azure SQL",
            "Provisioning SQL Databases",
            "Database Design and Schemas",
            "Writing SQL Queries",
            "Indexes and Performance Tuning",
            "Security and Role-based Access",
            "Monitoring and Auditing",
            "Backup, Restore, and Failover",
            "Project : Design and deploy a secure Azure SQL database with optimized queries."
        ]
    ),
    (
        "Azure Data Lake",
        "Learn how to handle large volumes of structured and unstructured data using Azure Data Lake.",
        [
            "Introduction to Azure Data Lake Storage",
            "Understanding Gen2 Features",
            "Data Lake Architecture",
            "Access Control with ACLs and RBAC",
            "Uploading and Managing Data",
            "Integration with Azure Services",
            "Best Practices for Data Organization",
            "Project : Organize and manage a hierarchical data lake for big data analytics."
        ]
    ),
    (
        "Azure Synapse Analytics",
        "Build end-to-end analytics solutions combining big data and data warehousing capabilities.",
        [
            "Introduction to Synapse Analytics",
            "Workspaces and Architecture Overview",
            "Data Ingestion and Integration",
            "Dedicated SQL Pools vs Serverless",
            "Writing and Optimizing T-SQL Queries",
            "Integrating with Power BI and Data Lake",
            "Pipeline Creation and Scheduling",
            "Security and Performance Monitoring",
            "Project : Develop a unified data warehouse and dashboard using Synapse and Power BI."
        ]
    ),
    (
        "Azure Data Factory",
        "Design and deploy powerful data pipelines to automate data movement and transformation.",
        [
            "Introduction to Azure Data Factory",
            "Creating Linked Services and Datasets",
            "Building Pipelines and Data Flows",
            "Data Movement and Copy Activities",
            "Data Transformation with Mapping Data Flows",
            "Triggers and Pipeline Scheduling",
            "Monitoring and Logging Pipelines",
            "CI/CD with Data Factory",
            "Project : Create and monitor a complete ETL pipeline using ADF with real-time triggers."
        ]
    ),
    (
        "Azure Databricks",
        "Perform big data processing and machine learning using Azure Databricks and Apache Spark.",
        [
            "Introduction to Azure Databricks and Spark",
            "Databricks Workspace and Clusters",
            "Working with Notebooks (Python/SQL)",
            "Structured Streaming and Delta Lake",
            "DataFrames and Spark SQL",
            "ML Pipelines in Databricks",
            "Integration with Data Lake and ADF",
            "Job Scheduling and Monitoring",
            "Project : Analyze and transform a large dataset using Spark and ML in Databricks."
        ]
    ),
    (
        "Azure Cosmos DB",
        "Build scalable and globally distributed NoSQL applications using Azure Cosmos DB.",
        [
            "Overview of Azure Cosmos DB",
            "Core SQL API and NoSQL Data Models",
            "Partitioning and Indexing Strategies",
            "Throughput Provisioning and Tuning",
            "Querying Data with SQL API",
            "Data Replication and Consistency Levels",
            "Backup, Restore, and SLA Guarantees",
            "Integrating with Azure Functions and SDKs",
            "Project : Design and implement a globally available application using Cosmos DB."
        ]
    ),
    (
        "Azure Stream Analytics",
        "Process real-time data from various sources and deliver instant insights.",
        [
            "Understanding Stream Analytics Concepts",
            "Setting Up Input and Output Sources",
            "Real-time SQL Queries on Streaming Data",
            "Windowing Functions and Joins",
            "Integrating with Event Hubs and IoT Hub",
            "Sending Output to Power BI, SQL, and Storage",
            "Monitoring and Scaling Jobs",
            "Project : Stream IoT sensor data and visualize it in real-time dashboards."
        ]
    ),
    (
        "Azure Key Vault",
        "Secure your cloud-based data engineering solutions using secrets, certificates, and keys.",
        [
            "Introduction to Azure Key Vault",
            "Creating and Managing Vaults",
            "Storing Secrets, Keys, and Certificates",
            "Access Control and RBAC",
            "Key Vault Integration with ADF and Databricks",
            "Using Managed Identities for Secure Access",
            "Audit Logs and Best Practices",
            "Project : Secure an end-to-end data pipeline using Azure Key Vault for secret management."
        ]
    )
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
                    # slug=f"{slugify(course_data['title'])}-{int(time.time())}",
                    slug=slugify(course_data['title']),
                    description=f"Complete {course_data['title']} bootcamp with hands-on projects",
                    # image="https://example.com/course-image.jpg",
                    image=course_data['image'],  # <-- Use this
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
