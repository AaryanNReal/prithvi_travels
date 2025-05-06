import Image from "next/image";

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  tag: string;
  imageUrl: string;
  price: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  description,
  price,
  date,
  tag,
  imageUrl,
}) => {
  return (
    <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition-transform transform hover:scale-105 duration-300 ease-in-out">
      <div className="relative">
        <Image
          src={imageUrl}
          alt={title} // Use the title as the alt text for better accessibility
          width={500}
          height={300}
          className="w-full h-64 object-cover"
        />
        <span className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
          {tag}
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-500 mb-2 mt-2 text-sm">{description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-medium text-gray-800">{price}</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;