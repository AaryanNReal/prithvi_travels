// components/FeaturedPosts.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import BlogCard from '../BlogCard';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: any;
  image: {
    imageURL: string;
    altText?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  createdBy?: {
    name: string;
    image?: string;
    description?: string;
  };
  tags?: Record<string, {
    name: string;
    slug: string;
    description?: string;
  }>;
  isFeatured?: boolean;
}

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('isFeatured', '==', true),
          orderBy('createdAt', 'desc'),
          limit(3) // Limit to 3 featured posts
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No featured posts found');
        } else {
          const postsData: BlogPost[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            postsData.push({
              id: doc.id,
              title: data.title,
              slug: data.slug,
              description: data.description,
              createdAt: data.createdAt,
              image: {
                imageURL: data.image?.imageURL,
                altText: data.image?.altText
              },
              category: data.category,
              createdBy: data.createdBy,
              tags: data.tags,
              isFeatured: true
            });
          });
          setFeaturedPosts(postsData);
        }
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        setError('Failed to load featured posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
    </div>
  );

  return (
    <section className="mb-12 m-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Posts</h2>
      <div className="grid grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-6">
        {featuredPosts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            title={post.title}
            description={post.description}
            createdAt={post.createdAt?.toDate().toISOString() || new Date().toISOString()}
            imageUrl={post.image.imageURL}
            imageAlt={post.image.altText}
            category={post.category}
            isFeatured={true} // Always true for featured section
            author={post.createdBy ? {
              name: post.createdBy.name,
              image: post.createdBy.image,
              role: post.createdBy.description
            } : undefined}
            tags={post.tags ? Object.values(post.tags).map(tag => ({
              id: tag.slug,
              name: tag.name,
              slug: tag.slug
            })) : []}
          />
        ))}
      </div>
    </section>
  );
}