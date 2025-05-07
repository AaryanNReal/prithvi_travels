'use client';
import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  imageUrl: string;
  category: {
    name: string;
    slug: string;
  };
  author?: {
    name: string;
    image: string;
  };
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Blog",
            slug: data.slug,
            description: data.description || "",
            createdAt: data.createdAt || { seconds: Date.now() / 1000 },
            imageUrl: data.image?.imageURL || "/default-blog-image.jpg",
            category: {
              name: data.category?.name || "Uncategorized",
              slug: data.category?.slug || "uncategorized"
            },
            author: data.author ? {
              name: data.author.name,
              image: data.author.image || "/default-avatar.jpg"
            } : undefined
          };
        });

        // Small delay to allow the skeleton animation to be visible
        await new Promise(resolve => setTimeout(resolve, 300));
        setBlogs(blogData);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <div className="text-4xl text-red-500 mb-4">⚠️</div>
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 mt-32 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton loading cards
          Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-opacity duration-300 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gray-200 dark:bg-gray-700 h-48 w-full animate-pulse"></div>
              <div className="p-4">
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-3/4 mb-3 rounded animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full mb-2 rounded animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 w-5/6 mb-2 rounded animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 w-2/3 mb-4 rounded animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/4 rounded animate-pulse"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/4 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] p-4 col-span-full">
            <p className="text-lg text-center text-gray-700 dark:text-gray-300">
              No blogs found. Check back later!
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              slug={blog.slug}
              description={blog.description}
              createdAt={new Date(blog.createdAt.seconds * 1000).toISOString()}
              imageUrl={blog.imageUrl}
              category={blog.category}
              author={blog.author}
            />
          ))
        )}
      </div>
    </div>
  );
}