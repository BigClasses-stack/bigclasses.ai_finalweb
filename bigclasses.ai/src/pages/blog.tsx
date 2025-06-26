import React, { useState } from 'react';
import { Search, Filter, Clock, User, ArrowRight, Star, BookOpen, Code, Briefcase, Users, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  author: string;
  readTime: string;
  category: string;
  level: string;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  isFree: boolean;
  isNew?: boolean;
}

const BlogPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample blog data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Complete JavaScript Fundamentals',
      description: 'Master JavaScript from basics to advanced concepts with hands-on projects and real-world examples.',
      author: 'BigClasses Expert',
      readTime: '8 min read',
      category: 'Programming',
      level: 'Beginner',
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
      tags: ['JavaScript', 'Web Development', 'Programming'],
      isFree: true,
      isNew: true
    },
    {
      id: '2',
      title: 'React Best Practices Guide',
      description: 'Learn industry-standard React patterns and best practices for building scalable applications.',
      author: 'BigClasses Team',
      readTime: '12 min read',
      category: 'Web Development',
      level: 'Intermediate',
      rating: 4.9,
      reviews: 856,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      tags: ['React', 'Frontend', 'Best Practices'],
      isFree: true
    },
    {
      id: '3',
      title: 'Data Science Career Roadmap',
      description: 'Complete guide to starting your data science journey with essential skills and tools.',
      author: 'Data Science Expert',
      readTime: '15 min read',
      category: 'Data Science',
      level: 'Beginner',
      rating: 4.7,
      reviews: 642,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: ['Data Science', 'Career', 'Python'],
      isFree: false
    },
    {
      id: '4',
      title: 'Machine Learning Algorithms Explained',
      description: 'Deep dive into popular ML algorithms with practical implementations and use cases.',
      author: 'AI Specialist',
      readTime: '20 min read',
      category: 'Machine Learning',
      level: 'Advanced',
      rating: 4.6,
      reviews: 423,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      tags: ['Machine Learning', 'AI', 'Algorithms'],
      isFree: false
    },
    {
      id: '5',
      title: 'UI/UX Design Principles',
      description: 'Essential design principles every developer should know for creating user-friendly interfaces.',
      author: 'Design Expert',
      readTime: '10 min read',
      category: 'Design',
      level: 'Beginner',
      rating: 4.5,
      reviews: 789,
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop',
      tags: ['UI/UX', 'Design', 'User Experience'],
      isFree: true
    },
    {
      id: '6',
      title: 'Cloud Computing Fundamentals',
      description: 'Introduction to cloud services, deployment models, and popular cloud platforms.',
      author: 'Cloud Architect',
      readTime: '14 min read',
      category: 'Cloud Computing',
      level: 'Intermediate',
      rating: 4.8,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      tags: ['Cloud', 'AWS', 'DevOps'],
      isFree: true,
      isNew: true
    }
  ];

  const subjects = [
    { name: 'Programming', count: 15, icon: Code },
    { name: 'Web Development', count: 23, icon: BookOpen },
    { name: 'Data Science', count: 18, icon: TrendingUp },
    { name: 'Machine Learning', count: 12, icon: Briefcase },
    { name: 'Design', count: 8, icon: Users },
    { name: 'Cloud Computing', count: 14, icon: Code }
  ];

  const languages = [
    { name: 'English', count: 89 },
    { name: 'Hindi', count: 45 },
    { name: 'Spanish', count: 23 },
    { name: 'French', count: 12 }
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearAllFilters = () => {
    setSelectedSubjects([]);
    setSelectedLanguages([]);
    setSelectedLevels([]);
    setSearchTerm('');
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(post.category);
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(post.level);
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSubject && matchesLevel && matchesSearch;
  });

  const handleCardClick = (postId: string) => {
    // In a real application, this would navigate to the specific blog post
    window.open(`https://stage.bigclasses.ai/blog/${postId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filter by</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Subject</h3>
                <div className="space-y-2">
                  {subjects.map((subject) => {
                    const Icon = subject.icon;
                    return (
                      <label key={subject.name} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.name)}
                          onChange={() => handleSubjectToggle(subject.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Icon className="ml-2 mr-2 w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{subject.name}</span>
                        <span className="ml-auto text-gray-500 text-sm">({subject.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Language</h3>
                <div className="space-y-2">
                  {languages.map((language) => (
                    <label key={language.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(language.name)}
                        onChange={() => handleLanguageToggle(language.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{language.name}</span>
                      <span className="ml-auto text-gray-500 text-sm">({language.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Level</h3>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={() => handleLevelToggle(level)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Explore the BigClasses Blog Catalog
              </h1>
              <p className="text-gray-600">
                Discover insights, tutorials, and expert knowledge across various tech domains
              </p>
            </div>

            {/* Active Filters */}
            {(selectedSubjects.length > 0 || selectedLevels.length > 0 || selectedLanguages.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {subject}
                      <button
                        onClick={() => handleSubjectToggle(subject)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedLevels.map((level) => (
                    <span
                      key={level}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {level}
                      <button
                        onClick={() => handleLevelToggle(level)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleCardClick(post.id)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {post.isNew && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          New
                        </span>
                      )}
                      {post.isFree && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {post.rating}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({post.reviews} reviews)
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {post.level}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

// No changes needed; this page is frontend-only and does not use backend APIs.