import React, { useState } from 'react';
import { Search, Clock, User, ArrowRight, Star, BookOpen, Code, Briefcase, Users, TrendingUp, Database, Brain, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

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
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample blog data (add new courses as requested)
  const blogPosts: BlogPost[] = [
    {
      id: '7',
      title: 'Data Analytics for Beginners',
      description: 'Kickstart your career in Data Analytics with practical guides and industry insights.',
      author: 'Analytics Guru',
      readTime: '11 min read',
      category: 'Data Analytics',
      level: 'Beginner',
      rating: 4.8,
      reviews: 1023,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      tags: ['Data Analytics', 'Excel', 'Business Intelligence'],
      isFree: true,
      isNew: true
    },
    {
      id: '8',
      title: 'Python Programming Essentials',
      description: 'A concise guide to Python programming for all levels.',
      author: 'Python Mentor',
      readTime: '9 min read',
      category: 'Python',
      level: 'Beginner',
      rating: 4.9,
      reviews: 1345,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop',
      tags: ['Python', 'Programming', 'Scripting'],
      isFree: true,
      isNew: true
    },
    {
      id: '9',
      title: 'Generative AI: The Future is Now',
      description: 'Explore the world of Generative AI and its real-world applications.',
      author: 'AI Innovator',
      readTime: '13 min read',
      category: 'Generative AI',
      level: 'Intermediate',
      rating: 4.7,
      reviews: 789,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=250&fit=crop',
      tags: ['AI', 'Generative AI', 'Deep Learning'],
      isFree: false
    },
    {
      id: '10',
      title: 'Machine Learning Crash Course',
      description: 'A fast-paced introduction to Machine Learning concepts and tools.',
      author: 'ML Coach',
      readTime: '16 min read',
      category: 'Machine Learning',
      level: 'Beginner',
      rating: 4.8,
      reviews: 1102,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=250&fit=crop',
      tags: ['Machine Learning', 'ML', 'AI'],
      isFree: true,
      isNew: true
    }
  ];

  // Add new subjects and icons
  const subjects = [
    { name: 'Programming', count: 15, icon: Code },
    { name: 'Web Development', count: 23, icon: BookOpen },
    { name: 'Data Science', count: 18, icon: TrendingUp },
    { name: 'Data Analytics', count: 10, icon: Database },
    { name: 'Python', count: 20, icon: Code },
    { name: 'Generative AI', count: 7, icon: Brain },
    { name: 'Machine Learning', count: 12, icon: Briefcase },
    { name: 'Design', count: 8, icon: Users },
    { name: 'Cloud Computing', count: 14, icon: Zap }
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
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
    // For Python Programming Essentials, navigate to /blogs/pythonclass
    if (postId === '8') {
      navigate('/blogs/pythonclass');
    } else {
      // For other posts, you should create corresponding pages or handle navigation appropriately
      // Example: navigate(`/blogs/${postId}`);
      // Or show a "Coming soon" message if the page doesn't exist
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4 w-full">
            <div
              className="bg-white rounded-lg shadow-sm p-0 sticky top-4" // changed p-6 to p-0 to remove sidebar padding
              style={{ fontSize: '1rem', fontFamily: 'Inter, Arial, sans-serif' }} // set font size to match blog post
            >
              <div className="flex items-center justify-between mb-6 px-6 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Filter by</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6 px-6">
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
              <div className="mb-6 px-6">
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

              {/* Level Filter */}
              <div className="px-6 pb-6">
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
          <div className="lg:w-3/4 w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                Explore the BigClasses Blog Catalog
              </h1>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                Discover insights, tutorials, and expert knowledge across various tech domains
              </p>
            </div>

            {/* Active Filters */}
            {(selectedSubjects.length > 0 || selectedLevels.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      style={{ fontFamily: 'Inter, Arial, sans-serif' }}
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
                      style={{ fontFamily: 'Inter, Arial, sans-serif' }}
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
                  style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    minHeight: '410px',
                    maxWidth: '370px',
                    margin: '0 auto'
                  }}
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      style={{ minHeight: '192px', maxHeight: '192px' }}
                    />
                    {/* Removed New and Free tags */}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center text-sm text-gray-500 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                      <User className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem' }}>
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
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
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        {post.level}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          style={{ fontFamily: 'Inter, Arial, sans-serif' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>No blog posts found</h3>
                <p className="text-gray-500" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Try adjusting your filters or search terms</p>
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