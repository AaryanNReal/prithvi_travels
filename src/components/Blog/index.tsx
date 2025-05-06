'use client'
import { useState } from "react";

const Blog = () => {
  // Sample blog posts data
  const [blogPosts] = useState([
    {
      id: 1,
      title: "Building Amazing Web Experiences",
      category: "Development",
      date: "May 3, 2025",
      excerpt: "Learn how to create stunning web experiences with modern frameworks and design techniques.",
      image: "/api/placeholder/600/400"
    },
    {
      id: 2,
      title: "The Future of React Development",
      category: "Technology",
      date: "May 1, 2025",
      excerpt: "Explore the latest features and future direction of React development.",
      image: "/api/placeholder/600/400"
    },
    {
      id: 3,
      title: "Optimizing Web Performance",
      category: "Performance",
      date: "April 28, 2025",
      excerpt: "Strategies to improve loading times and overall web application performance.",
      image: "/api/placeholder/600/400"
    }
  ]);

  return (
    <section
      id="blog"
      className="bg-gray-50 dark:bg-gray-900 py-16 md:py-20 lg:py-28 relative overflow-hidden"
    >
      {/* Spotlight Effect - Top Right */}
      <div className="absolute right-0 top-0 opacity-70 z-0 pointer-events-none">
        <svg
          width="238"
          height="531"
          viewBox="0 0 238 531"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            opacity="0.3"
            x="422.819"
            y="-70.8145"
            width="196"
            height="541.607"
            rx="2"
            transform="rotate(51.2997 422.819 -70.8145)"
            fill="url(#paint0_linear_83:2)"
          />
          <rect
            opacity="0.3"
            x="426.568"
            y="144.886"
            width="59.7544"
            height="541.607"
            rx="2"
            transform="rotate(51.2997 426.568 144.886)"
            fill="url(#paint1_linear_83:2)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_83:2"
              x1="517.152"
              y1="-251.373"
              x2="517.152"
              y2="459.865"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFD700" />
              <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_83:2"
              x1="455.327"
              y1="-35.673"
              x2="455.327"
              y2="675.565"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFD700" />
              <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Spotlight Effect - Bottom Left */}
      <div className="absolute left-0 bottom-0 opacity-70 z-0 pointer-events-none">
        <svg
          width="238"
          height="531"
          viewBox="0 0 238 531"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            opacity="0.3"
            x="422.819"
            y="-70.8145"
            width="196"
            height="541.607"
            rx="2"
            transform="rotate(51.2997 422.819 -70.8145)"
            fill="url(#paint0_linear_83:2)"
          />
          <rect
            opacity="0.3"
            x="426.568"
            y="144.886"
            width="59.7544"
            height="541.607"
            rx="2"
            transform="rotate(51.2997 426.568 144.886)"
            fill="url(#paint1_linear_83:2)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_83:2"
              x1="517.152"
              y1="-251.373"
              x2="517.152"
              y2="459.865"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFD700" />
              <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_83:2"
              x1="455.327"
              y1="-35.673"
              x2="455.327"
              y2="675.565"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFD700" />
              <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-wrap justify-center -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 lg:mb-16 text-center max-w-[570px]">
              <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-5xl mb-4">
                Latest Blog Posts
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Check out our latest articles and stay up-to-date with the newest
                technologies and trends
              </p>
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="flex flex-wrap -mx-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="w-full md:w-1/2 lg:w-1/3 px-4 mb-10">
              <div className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 py-1 px-3 text-xs rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-black dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {post.excerpt}
                  </p>
                  <a
                    href="#"
                    className="inline-block py-2 px-6 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition duration-300"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;