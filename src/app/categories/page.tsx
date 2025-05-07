// app/categories/page.tsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  count?: number; // Optional count of posts in this category
}

interface BlogPost {
  id: string;
  category: {
    name: string;
    slug: string;
  };
}

export default async function CategoriesPage() {
  // Fetch posts from Firestore
  const querySnapshot = await getDocs(collection(db, 'blogs'));
  
  // Extract and count categories
  const categoriesMap = new Map<string, { name: string; slug: string; count: number }>();
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as BlogPost;
    if (data.category) {
      const existing = categoriesMap.get(data.category.slug);
      if (existing) {
        categoriesMap.set(data.category.slug, {
          ...existing,
          count: existing.count + 1
        });
      } else {
        categoriesMap.set(data.category.slug, {
          name: data.category.name,
          slug: data.category.slug,
          count: 1
        });
      }
    }
  });

  const categories = Array.from(categoriesMap.values())
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return (
    <div className="min-h-screen mt-16 bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Categories Directory</h1>
          <p className="mt-2 text-gray-600">
            Browse all {categories.length} categories of our blog content
          </p>
        </div>

        {/* Alphabet Navigation (like LinkedIn) */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
              <a 
                key={letter}
                href={`#${letter}`}
                className="text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => {
            const letterCategories = categories.filter(c => 
              c.name.charAt(0).toUpperCase() === letter
            );
            
            if (letterCategories.length === 0) return null;

            return (
              <div key={letter} id={letter} className="border-b last:border-b-0">
                <div className="px-6 py-4 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800">{letter}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                  {letterCategories.map((category) => (
                    <Link 
                      key={category.slug}
                      href={`/blog/${category.slug}`}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150 border-r border-b"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {category.count} {category.count === 1 ? 'post' : 'posts'}
                          </p>
                        </div>
                        <span className="text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state for letters with no categories */}
        {categories.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No categories found in the blog.</p>
          </div>
        )}
      </div>
    </div>
  );
}