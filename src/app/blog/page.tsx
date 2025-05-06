'use client';
import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

interface Blog {
  id: string;
  title: string;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <FiAlertCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">
          No blogs found. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="container  px-4 py-8">
      <div className="grid grid-cols-1 mt-32 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            id={blog.id}
            title={blog.title}
            description={blog.description}
            createdAt={new Date(blog.createdAt.seconds * 1000).toISOString()}
            imageUrl={blog.imageUrl}
            category={blog.category}
            author={blog.author}
          />
        ))}
      </div>
    </div>
  );
}