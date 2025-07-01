import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark, ThumbsUp, MessageCircle, Twitter, Facebook, Linkedin, Copy, Check, Tag, Eye, ChevronRight, Code, Play, Book, Target, Zap, TrendingUp, Gift, Star } from 'lucide-react';

interface BlogArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  gradient: string;
  views: number;
  likes: number;
  comments: number;
  featuredImage: string;
}

interface Topic {
  id: string;
  title: string;
  anchor: string;
  icon: React.ElementType;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  gradient: string;
  icon: React.ElementType;
  link: string;
}

const PythonClassBlogPage = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

  const topics: Topic[] = [
    { id: 'introduction', title: 'Introduction to Classes', anchor: 'introduction', icon: Book },
    { id: 'creating-classes', title: 'Creating Classes', anchor: 'creating-classes', icon: Code },
    { id: 'constructors', title: 'Constructors (__init__)', anchor: 'constructors', icon: Play },
    { id: 'attributes', title: 'Attributes & Methods', anchor: 'attributes', icon: Target },
    { id: 'inheritance', title: 'Inheritance', anchor: 'inheritance', icon: Zap },
    { id: 'encapsulation', title: 'Encapsulation', anchor: 'encapsulation', icon: Book },
    { id: 'polymorphism', title: 'Polymorphism', anchor: 'polymorphism', icon: Star },
    { id: 'best-practices', title: 'Best Practices', anchor: 'best-practices', icon: TrendingUp }
  ];

  const advertisements: Advertisement[] = [
    {
      id: 1,
      title: "Python Masterclass 2024",
      description: "Complete Python course from beginner to advanced. 50+ hours of content!",
      buttonText: "Enroll Now",
      gradient: "from-blue-500 to-purple-600",
      icon: Code,
      link: "#"
    },
    {
      id: 2,
      title: "Free Python Cheat Sheet",
      description: "Download our comprehensive Python syntax reference guide.",
      buttonText: "Download Free",
      gradient: "from-green-500 to-teal-600",
      icon: Gift,
      link: "#"
    },
    {
      id: 3,
      title: "Python Interview Prep",
      description: "Ace your Python interviews with 200+ practice questions.",
      buttonText: "Start Practicing",
      gradient: "from-orange-500 to-red-600",
      icon: Target,
      link: "#"
    }
  ];

  const article: BlogArticle = {
    id: 1,
    title: "Python Classes: A Complete Guide to Object-Oriented Programming",
    content: `
# Introduction to Python Classes

Python classes are the foundation of object-oriented programming (OOP) in Python. They allow you to create objects that encapsulate data and functionality together, making your code more organized, reusable, and maintainable.

Classes serve as blueprints for creating objects (instances), and they define the attributes (data) and methods (functions) that the objects will have.

## Creating Your First Python Class

Let's start with a simple example of a Python class:

\`\`\`python
class Dog:
    # Class attribute
    species = "Canis lupus"
    
    def __init__(self, name, age):
        # Instance attributes
        self.name = name
        self.age = age
    
    def bark(self):
        return f"{self.name} says Woof!"
    
    def get_info(self):
        return f"{self.name} is {self.age} years old"
\`\`\`

This simple class demonstrates the basic structure of a Python class with attributes and methods.

## Understanding Constructors (__init__)

The \`__init__\` method is a special method called a constructor. It's automatically called when you create a new instance of the class:

\`\`\`python
# Creating instances
my_dog = Dog("Buddy", 3)
another_dog = Dog("Max", 5)

print(my_dog.bark())  # Output: Buddy says Woof!
print(another_dog.get_info())  # Output: Max is 5 years old
\`\`\`

### Key Points about Constructors:
- Always named \`__init__\`
- First parameter is always \`self\`
- Used to initialize instance attributes
- Called automatically when creating objects

## Attributes and Methods

Python classes can have two types of attributes:

### Class Attributes
Shared by all instances of the class:

\`\`\`python
class Car:
    wheels = 4  # Class attribute
    
    def __init__(self, brand, model):
        self.brand = brand  # Instance attribute
        self.model = model  # Instance attribute
\`\`\`

### Instance Attributes
Unique to each instance:

\`\`\`python
car1 = Car("Toyota", "Camry")
car2 = Car("Honda", "Civic")

print(car1.brand)  # Output: Toyota
print(car2.brand)  # Output: Honda
print(Car.wheels)  # Output: 4
\`\`\`

## Inheritance in Python

Inheritance allows you to create new classes based on existing classes:

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        pass

class Dog(Animal):  # Dog inherits from Animal
    def speak(self):
        return f"{self.name} barks!"

class Cat(Animal):  # Cat inherits from Animal
    def speak(self):
        return f"{self.name} meows!"

# Usage
dog = Dog("Buddy")
cat = Cat("Whiskers")

print(dog.speak())  # Output: Buddy barks!
print(cat.speak())  # Output: Whiskers meows!
\`\`\`

### Benefits of Inheritance:
- Code reusability
- Hierarchical organization
- Method overriding
- Polymorphism support

## Encapsulation

Encapsulation is about restricting access to certain parts of an object:

\`\`\`python
class BankAccount:
    def __init__(self, initial_balance):
        self._balance = initial_balance  # Protected attribute
        self.__account_number = "12345"  # Private attribute
    
    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
            return True
        return False
    
    def get_balance(self):
        return self._balance
    
    def _internal_method(self):  # Protected method
        return "Internal processing"
    
    def __private_method(self):  # Private method
        return "Private processing"
\`\`\`

### Access Modifiers:
- **Public**: No underscore prefix
- **Protected**: Single underscore prefix (_)
- **Private**: Double underscore prefix (__)

## Polymorphism

Polymorphism allows objects of different classes to be treated as objects of a common base class:

\`\`\`python
class Shape:
    def area(self):
        pass
    
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    def area(self):
        return 3.14159 * self.radius ** 2
    
    def perimeter(self):
        return 2 * 3.14159 * self.radius

# Polymorphism in action
shapes = [Rectangle(5, 3), Circle(4)]

for shape in shapes:
    print(f"Area: {shape.area()}")
    print(f"Perimeter: {shape.perimeter()}")
\`\`\`

## Best Practices for Python Classes

### 1. Follow Naming Conventions
- Class names should use CapWords (PascalCase)
- Method and attribute names should use lowercase with underscores

### 2. Use Docstrings
\`\`\`python
class Student:
    """A class to represent a student."""
    
    def __init__(self, name, grade):
        """Initialize a student with name and grade."""
        self.name = name
        self.grade = grade
    
    def study(self, subject):
        """Make the student study a subject."""
        return f"{self.name} is studying {subject}"
\`\`\`

### 3. Keep It Simple
- Single Responsibility Principle
- Don't make classes do too many things
- Use composition over inheritance when appropriate

### 4. Use Properties for Validation
\`\`\`python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius
    
    @property
    def celsius(self):
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero")
        self._celsius = value
    
    @property
    def fahrenheit(self):
        return (self._celsius * 9/5) + 32
\`\`\`

### 5. Implement Special Methods
\`\`\`python
class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
    def __repr__(self):
        return f"Book('{self.title}', '{self.author}', {self.pages})"
    
    def __len__(self):
        return self.pages
    
    def __eq__(self, other):
        if isinstance(other, Book):
            return self.title == other.title and self.author == other.author
        return False
\`\`\`

## Conclusion

Python classes are powerful tools that enable you to write more organized, maintainable, and reusable code. By understanding concepts like inheritance, encapsulation, and polymorphism, you can build robust applications that follow object-oriented programming principles.

Remember to start simple and gradually incorporate more advanced concepts as you become comfortable with the basics. Practice creating your own classes and experimenting with different OOP patterns to master this fundamental aspect of Python programming.
    `,
    excerpt: "Master Python classes and object-oriented programming with practical examples, best practices, and advanced concepts.",
    category: "Python Programming",
    author: {
      name: "Alex Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Senior Python Developer with 10+ years of experience. Passionate about clean code, OOP design patterns, and teaching programming concepts."
    },
    date: "2024-06-30",
    readTime: "15 min read",
    tags: ["Python", "OOP", "Classes", "Programming", "Tutorial"],
    gradient: "from-blue-600 via-purple-600 to-blue-800",
    views: 2340,
    likes: 156,
    comments: 42,
    featuredImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop"
  };

  useEffect(() => {
    setLikeCount(article.likes);
    
    // Scroll spy functionality
    const handleScroll = () => {
      const sections = topics.map(topic => document.getElementById(topic.anchor)).filter(Boolean);
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(topics[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (anchor: string, id: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 id="$1" class="text-3xl font-bold text-gray-900 mb-6 mt-8 scroll-mt-20">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 id="$1" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-gray-800 mb-3 mt-5">$1</h3>')
      .replace(/```python\n([\s\S]*?)\n```/g, '<div class="bg-gray-900 text-green-400 p-4 rounded-lg my-4 overflow-x-auto"><pre><code>$1</code></pre></div>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/^\*\* (.*?):/gm, '<strong class="font-semibold text-gray-900">$1:</strong>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .split('\n')
      .map(line => {
        if (line.startsWith('<h') || line.startsWith('<li') || line.includes('</p><p') || line.includes('<div class="bg-gray-900') || line.includes('<code class=')) {
          return line;
        }
        return line.trim() ? `<p class="text-gray-700 leading-relaxed mb-4">${line}</p>` : '';
      })
      .join('')
      .replace(/^# Introduction to Python Classes/m, '<h1 id="introduction" class="text-3xl font-bold text-gray-900 mb-6 mt-8 scroll-mt-20">Introduction to Python Classes</h1>')
      .replace(/^## Creating Your First Python Class/m, '<h2 id="creating-classes" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Creating Your First Python Class</h2>')
      .replace(/^## Understanding Constructors \(__init__\)/m, '<h2 id="constructors" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Understanding Constructors (__init__)</h2>')
      .replace(/^## Attributes and Methods/m, '<h2 id="attributes" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Attributes and Methods</h2>')
      .replace(/^## Inheritance in Python/m, '<h2 id="inheritance" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Inheritance in Python</h2>')
      .replace(/^## Encapsulation/m, '<h2 id="encapsulation" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Encapsulation</h2>')
      .replace(/^## Polymorphism/m, '<h2 id="polymorphism" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Polymorphism</h2>')
      .replace(/^## Best Practices for Python Classes/m, '<h2 id="best-practices" class="text-2xl font-semibold text-gray-800 mb-4 mt-6 scroll-mt-20">Best Practices for Python Classes</h2>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => console.log('Navigate back')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Articles</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isLiked ? 'bg-red-100 text-red-600 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isBookmarked ? 'bg-blue-100 text-blue-600 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                <Bookmark className={`h-4 w-4 transition-all duration-300 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    {[
                      { platform: 'twitter', icon: Twitter, label: 'Share on Twitter', color: 'text-blue-400' },
                      { platform: 'facebook', icon: Facebook, label: 'Share on Facebook', color: 'text-blue-600' },
                      { platform: 'linkedin', icon: Linkedin, label: 'Share on LinkedIn', color: 'text-blue-700' }
                    ].map(({ platform, icon: Icon, label, color }) => (
                      <button
                        key={platform}
                        onClick={() => handleShare(platform)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Left Sidebar - Topics */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Book className="h-5 w-5 mr-2 text-blue-600" />
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => scrollToSection(topic.anchor, topic.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-300 transform hover:scale-105 ${
                        activeSection === topic.id
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-md'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
                        activeSection === topic.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium truncate">{topic.title}</span>
                      <ChevronRight className={`h-3 w-3 ml-auto transition-transform duration-300 ${
                        activeSection === topic.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          {/* Hero Section with Python Image */}
          <div className={`bg-gradient-to-br ${article.gradient} rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=400&fit=crop"
                alt="Python programming"
                className="w-full h-full object-cover rounded-full animate-pulse"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-bounce">
                  {article.category}
                </span>
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{article.comments}</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight animate-in slide-in-from-left duration-1000">
                {article.title}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 leading-relaxed animate-in slide-in-from-left duration-1000 delay-200">
                {article.excerpt}
              </p>
              
              <div className="flex items-center space-x-6 animate-in slide-in-from-left duration-1000 delay-400">
                <div className="flex items-center space-x-3">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full border-2 border-white/30 animate-pulse"
                  />
                  <div>
                    <p className="font-semibold">{article.author.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <article className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200/50 shadow-lg">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
            
            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm rounded-full hover:from-blue-200 hover:to-purple-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Author Bio */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200/50 shadow-lg">
            <div className="flex items-start space-x-4">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-16 h-16 rounded-full border-2 border-blue-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  About {article.author.name}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {article.author.bio}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Advertisements */}
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {advertisements.map((ad) => {
              const Icon = ad.icon;
              return (
                <div
                  key={ad.id}
                  className={`bg-gradient-to-br ${ad.gradient} rounded-2xl p-6 text-white relative overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer group`}
                  onClick={() => window.open(ad.link, '_blank')}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                    <Icon className="w-full h-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className="h-6 w-6" />
                      <h3 className="font-bold text-lg">{ad.title}</h3>
                    </div>
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                      {ad.description}
                    </p>
                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white/40">
                      {ad.buttonText}
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
            
            {/* Newsletter Signup */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Stay Updated
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Get the latest Python tutorials and programming tips delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PythonClassBlogPage;