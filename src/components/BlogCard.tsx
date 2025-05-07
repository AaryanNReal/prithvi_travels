import Image from "next/image";
import Link from "next/link";
import { ClockIcon, CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface BlogCardProps {
  id: string;
  title: string;
  slug:string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  imageUrl: string;
  imageAlt?: string;
  category: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  author?: {
    name: string;
    image: string;
    role?: string;
  };
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
  readingTime?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  slug,
  description,
  content = "",
  createdAt,
  updatedAt,
  imageUrl,
  imageAlt = "",
  category,
  isFeatured = false,
  author,
  tags = [],
  readingTime,
}) => {
  // Calculate reading time if not provided
  const calculateReadingTime = () => {
    if (readingTime) return readingTime;
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link 
      href={`/blog/${category.slug}/${slug}`} 
      className="block group mb-6 hover:no-underline"
      aria-label={`Read more about ${title}`}
    >
      <div className={`
        rounded-xl overflow-hidden shadow-lg 
        bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400
        ${isFeatured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
      `}>
        {/* Image with badges */}
        <div className="relative aspect-video">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={600}
            height={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={isFeatured}
          />
          
          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Featured
            </span>
          )}
          
          {/* Category badge */}
          <span className="absolute bottom-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
            {category.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-col h-full">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
              {description}
            </p>
            
            {/* Metadata */}
            <div className="mt-auto">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag.id}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {/* Author and dates */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  {author && (
                    <div className="flex items-center">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={author.image}
                          alt={author.name}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                      <span>{author.name}</span>
                      {author.role && <span className="hidden sm:inline">• {author.role}</span>}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {readingTime && (
                    <div className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span>{calculateReadingTime()}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>{formatDate(createdAt)}</span>
                    {updatedAt && (
                      <span className="hidden sm:inline"> (Updated: {formatDate(updatedAt)})</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Read more link */}
              <div className="mt-3 flex justify-end">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center">
                  Read more
                  <ArrowRightIcon className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;