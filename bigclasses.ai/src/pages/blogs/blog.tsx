// import React, { useState, useMemo } from 'react';
// import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Footer';
// import { Search, Filter, Calendar, User, ArrowRight, Tag, BarChart3, Database, Brain, TrendingUp, Users, BookOpen } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface BlogPost {
//   id: number;
//   title: string;
//   link: string;
//   excerpt: string;
//   category: string;
//   author: string;
//   date: string;
//   readTime: string;
//   tags: string[];
//   gradient: string;
//   icon: React.ReactNode;
// }

// const BlogLandingPage = () => {
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedTags, setSelectedTags] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const navigate = useNavigate();

//   // Sample blog data with colorful gradients and icons
//   const blogPosts: BlogPost[] = [
//     {
//       id: 1,
//       title: "Data Science vs Data Engineering",
//       link: "/blog/data-science-vs-data-engineering",
//       excerpt: "Understanding the key differences between data science and data engineering roles in modern organizations.",
//       category: "Data Science",
//       author: "Sarah Chen",
//       date: "2024-06-25",
//       readTime: "5 min read",
//       tags: ["Data Science", "Data Engineering", "Career"],
//       gradient: "from-orange-400 to-blue-400",
//       icon: <BarChart3 className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 2,
//       title: "Difference Between Data Mining vs. Data Warehousing",
//       link: "/blog/data-mining-vs-data-warehousing",
//       excerpt: "Explore the fundamental differences between data mining and data warehousing techniques.",
//       category: "Data Analytics",
//       author: "Mike Johnson",
//       date: "2024-06-23",
//       readTime: "8 min read",
//       tags: ["Data Mining", "Data Warehousing", "Analytics"],
//       gradient: "from-green-400 to-teal-500",
//       icon: <Database className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 3,
//       title: "Data Analyst vs Data Engineer: What Should You Choose?",
//       link: "/blog/data-analyst-vs-data-engineer",
//       excerpt: "A comprehensive comparison to help you decide between data analyst and data engineer career paths.",
//       category: "Career Guide",
//       author: "Alex Rodriguez",
//       date: "2024-06-20",
//       readTime: "12 min read",
//       tags: ["Career", "Data Analyst", "Data Engineer"],
//       gradient: "from-purple-400 to-pink-400",
//       icon: <Users className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 4,
//       title: "Data Analyst Roles and Responsibilities: Key Tasks and Skills",
//       link: "/blog/data-analyst-roles-responsibilities",
//       excerpt: "Everything you need to know about data analyst roles, responsibilities, and required skills.",
//       category: "Career Guide",
//       author: "Emily Davis",
//       date: "2024-06-18",
//       readTime: "6 min read",
//       tags: ["Data Analyst", "Skills", "Career"],
//       gradient: "from-green-300 to-blue-500",
//       icon: <TrendingUp className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 5,
//       title: "Data Analyst vs Data Scientist",
//       link: "/blog/data-analyst-vs-data-scientist",
//       excerpt: "Understanding the distinctions between data analyst and data scientist positions.",
//       category: "Data Science",
//       author: "David Kim",
//       date: "2024-06-15",
//       readTime: "10 min read",
//       tags: ["Data Analyst", "Data Scientist", "Comparison"],
//       gradient: "from-yellow-300 to-blue-400",
//       icon: <Brain className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 6,
//       title: "Business Analyst Course Syllabus",
//       link: "/blog/business-analyst-course-syllabus",
//       excerpt: "Complete syllabus and curriculum for becoming a successful business analyst.",
//       category: "Courses",
//       author: "Lisa Wang",
//       date: "2024-06-12",
//       readTime: "7 min read",
//       tags: ["Business Analyst", "Course", "Syllabus"],
//       gradient: "from-orange-300 to-yellow-400",
//       icon: <BookOpen className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 7,
//       title: "Data Analyst Course Syllabus",
//       link: "/blog/data-analyst-course-syllabus",
//       excerpt: "Comprehensive guide to data analyst course curriculum and learning path.",
//       category: "Courses",
//       author: "John Smith",
//       date: "2024-06-10",
//       readTime: "9 min read",
//       tags: ["Data Analyst", "Course", "Learning"],
//       gradient: "from-green-400 to-blue-600",
//       icon: <BarChart3 className="h-16 w-16 text-white/90" />
//     },
//     {
//       id: 8,
//       title: "Data Science Course Syllabus – The Detailed Guide",
//       link: "/blog/data-science-course-syllabus",
//       excerpt: "Everything you need to know about data science course structure and topics covered.",
//       category: "Courses",
//       author: "Maria Garcia",
//       date: "2024-06-08",
//       readTime: "11 min read",
//       tags: ["Data Science", "Course", "Guide"],
//       gradient: "from-red-400 to-orange-500",
//       icon: <Brain className="h-16 w-16 text-white/90" />
//     }
//   ];

//   // Get unique categories and tags
//   const categories = Array.from(new Set(blogPosts.map(post => post.category)));
//   const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

//   // Handle category filter changes
//   const handleCategoryChange = (category: string) => {
//     setSelectedCategories(prev => 
//       prev.includes(category) 
//         ? prev.filter(c => c !== category)
//         : [...prev, category]
//     );
//   };

//   // Handle tag filter changes
//   const handleTagChange = (tag: string) => {
//     setSelectedTags(prev => 
//       prev.includes(tag)
//         ? prev.filter(t => t !== tag)
//         : [...prev, tag]
//     );
//   };

//   // Filter posts based on selected filters and search
//   const filteredPosts = useMemo(() => {
//     return blogPosts.filter(post => {
//       const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category);
//       const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => post.tags.includes(tag));
//       const matchesSearch = !searchTerm || 
//         post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
//       return matchesCategory && matchesTag && matchesSearch;
//     });
//   }, [selectedCategories, selectedTags, searchTerm, blogPosts]);

//   const handleCardClick = (postId: number) => {
//     // Redirect to /blog/datascience for the first blog card
//     if (postId === 1) {
//       navigate('/blog/datascience');
//     } else {
//       // For other posts, you can implement navigation as needed
//       // Example: navigate to the post's link
//       const post = blogPosts.find(p => p.id === postId);
//       if (post) {
//         navigate(post.link);
//       }
//     }
//   };

//   const clearAllFilters = () => {
//     setSelectedCategories([]);
//     setSelectedTags([]);
//     setSearchTerm('');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
//       <Navbar />
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 DataBlog
//               </h1>
//             </div>
//             <div className="relative max-w-md w-full">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search articles..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left Sidebar - Filters */}
//           <aside className="lg:w-1/4">
//             <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm sticky top-24">
//               <div className="flex items-center gap-2 mb-6">
//                 <Filter className="h-5 w-5 text-gray-600" />
//                 <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
//               </div>

//               {/* Categories */}
//               <div className="mb-6">
//                 <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
//                 <div className="space-y-3">
//                   {categories.map((category) => (
//                     <label key={category} className="flex items-center space-x-3 cursor-pointer group">
//                       <input
//                         type="checkbox"
//                         checked={selectedCategories.includes(category)}
//                         onChange={() => handleCategoryChange(category)}
//                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                       />
//                       <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
//                         {category}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Tags */}
//               <div>
//                 <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
//                 <div className="space-y-3 max-h-48 overflow-y-auto">
//                   {allTags.map((tag) => (
//                     <label key={tag} className="flex items-center space-x-3 cursor-pointer group">
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag)}
//                         onChange={() => handleTagChange(tag)}
//                         className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
//                       />
//                       <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
//                         {tag}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Clear Filters */}
//               {(selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm) && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="w-full mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Clear All Filters
//                 </button>
//               )}
//             </div>
//           </aside>

//           {/* Right Content - Blog Cards */}
//           <main className="lg:w-3/4">
//             <div className="mb-6">
//               <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                 Latest Articles
//               </h2>
//               <p className="text-gray-600">
//                 {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
//               </p>
//             </div>

//             {filteredPosts.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="text-gray-400 mb-4">
//                   <Search className="h-12 w-12 mx-auto" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
//                 <p className="text-gray-600">Try adjusting your filters or search terms.</p>
//               </div>
//             ) : (
//               <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
//                 {filteredPosts.map((post) => (
//                   <article
//                     key={post.id}
//                     onClick={() => handleCardClick(post.id)}
//                     className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
//                   >
//                     <div className={`bg-gradient-to-br ${post.gradient} rounded-2xl p-6 mb-4 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}>
//                       {/* Background Pattern */}
//                       <div className="absolute inset-0 opacity-10">
//                         <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full"></div>
//                         <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
//                       </div>
                      
//                       {/* Content */}
//                       <div className="relative z-10 flex items-center justify-between">
//                         <div className="flex-1">
//                           <div className="mb-4">
//                             {post.icon}
//                           </div>
//                           <h3 className="text-xl font-bold text-white mb-2 leading-tight">
//                             {post.title}
//                           </h3>
//                         </div>
//                       </div>
                      
//                       {/* Arrow */}
//                       <div className="absolute bottom-6 right-6">
//                         <ArrowRight className="h-6 w-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
//                       </div>
//                     </div>
                    
//                     {/* Card Details */}
//                     <div className="px-2">
//                       <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                         {post.excerpt}
//                       </p>

//                       <div className="flex items-center justify-between mb-3">
//                         <div className="flex items-center text-xs text-gray-500">
//                           <User className="h-3 w-3 mr-1" />
//                           <span className="mr-3">{post.author}</span>
//                           <Calendar className="h-3 w-3 mr-1" />
//                           <span className="mr-3">{new Date(post.date).toLocaleDateString()}</span>
//                           <span>{post.readTime}</span>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
//                           {post.category}
//                         </span>
                        
//                         <div className="flex flex-wrap gap-1">
//                           {post.tags.slice(0, 2).map((tag) => (
//                             <span
//                               key={tag}
//                               className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md"
//                             >
//                               #{tag}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default BlogLandingPage;

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
//another blog ui
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState } from 'react';
import { Search, Filter, Clock, User, ArrowRight, Star, BookOpen, Code, Briefcase, Users, TrendingUp } from 'lucide-react';
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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample blog data
  const blogPosts: BlogPost[] = [
      {
      id: '1',
      title: 'Complete Python Fundamentals',
      description: 'Master Python from basics to advanced concepts with hands-on projects and real-world applications.',
      author: 'PythonClass Expert',
      readTime: '12 min read',
      category: 'Programming',
      level: 'Beginner',
      rating: 4.9,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
      tags: ['Python', 'Data Science', 'Programming', 'Backend Development'],
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
    const post = blogPosts.find(p => p.id === postId);
    if (post && post.title === 'Complete Python Fundamentals') {
      navigate('/blog/pythonclass');
    } else {
      // fallback: open external or do nothing
      // window.open(`https://stage.bigclasses.ai/blog/${postId}`, '_blank');
    }
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