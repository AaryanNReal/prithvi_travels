// app/blog/[category]/[title]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

// Custom reading time calculator
const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

// Format timestamp to readable date
const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate();
    return format(date, 'MMMM d, yyyy \'at\' h:mm a');
  } catch (e) {
    return '';
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const encodedCategory = params.category as string;
  const encodedTitle = params.title as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Decode URL parameters
  const categorySlug = decodeURIComponent(encodedCategory || '');
  const titleSlug = decodeURIComponent(encodedTitle || '');

  useEffect(() => {
    if (!categorySlug || !titleSlug) return;

    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('category.slug', '==', categorySlug),
          where('title', '==', titleSlug),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Blog post not found');
        } else {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setBlog({ 
            id: doc.id,
            ...data,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [categorySlug, titleSlug]);

  if (loading) return (
    <div className="flex justify-center mt-10 items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-28 py-12">
      <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
      <Link 
        href="/blog"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Blog
      </Link>
    </div>
  );

  if (!blog) return (
    <div className="text-center mt-28 py-12">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">No blog post found</h2>
      <Link 
        href="/blog"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        Browse All Posts
      </Link>
    </div>
  );

  // Calculate reading time
  const readTime = calculateReadingTime(blog.content || '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-28 sm:px-6 lg:px-8">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Featured Image */}
        {blog.image?.imageURL && (
          <div className="relative h-64 md:h-80 lg:h-96 w-full">
            <Image
              src={blog.image.imageURL}
              alt={blog.image.altText || blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 md:p-8 lg:p-10">
          {/* Category */}
          {blog.category && (
            <Link 
              href={`/blog/${blog.category.slug}`}
              className="inline-block mb-4 px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {blog.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {blog.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-300 mb-6 gap-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readTime}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Published: {formatDate(blog.createdAt)}</span>
            </div>
            {blog.updatedAt && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Updated: {formatDate(blog.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Author */}
          {blog.createdBy && (
            <div className="flex items-center mb-8">
              <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                {blog.createdBy.image && (
                  <Image
                    src={blog.createdBy.image}
                    alt={blog.createdBy.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{blog.createdBy.name}</p>
                {blog.createdBy.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{blog.createdBy.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Content */}
         

          {/* Tags */}
          {blog.tags && Object.keys(blog.tags).length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(blog.tags).map((tag: any) => (
                  <Link 
                    key={tag.slug}
                    href={`/blog/tags/${tag.slug}`}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog Link */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/blog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}