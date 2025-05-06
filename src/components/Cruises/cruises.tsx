import React from "react";
import ArticleCard from "../Cruises/cruise_card"; // Adjust the import path as necessary

const Cruises = () => {
  const tours = [
    {
      title: "Discover the Hidden Gems of Domestic Travel",
      description: "Explore the beauty and diversity of domestic travel destinations.",
      price: "Free",
      date: "September 20, 2023",
      tag: "Travel",
      imageUrl: "/images/domestic1.jpg",
    },
    {
      title: "A Journey Through the Mountains",
      description: "Experience the tranquility of the mountains and reconnect with nature.",
      price: "Free",
      date: "October 5, 2023",
      tag: "Adventure",
      imageUrl: "/images/domestic2.jpg",
    },
    {
      title: "Beach Escapes: Relax and Unwind",
      description: "Find your perfect getaway at some of the most beautiful beaches.",
      price: "Free",
      date: "November 12, 2023",
      tag: "Relaxation",
      imageUrl: "/images/domestic3.jpg",
    },
  ];

  return (
    <div className="relative">
      {/* Background Image */}
      <div
        className="absolute inset-0  -z-10"
        style={{
          backgroundImage: "url(/images/video/shape.svg)", // Path to your local shape.svg
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>

      {/* Content Container */}
      <div className="container mx-auto mt-10 px-6 py-12 border-b border-gray-300 relative">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Explore Cruises
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Discover the beauty and diversity of domestic travel destinations. From serene beaches to majestic mountains, explore the hidden gems within your own country.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          {tours.map((tour, index) => (
            <ArticleCard
              key={index}
              title={tour.title}
              description={tour.description}
              price={tour.price}
              date={tour.date}
              tag={tour.tag}
              imageUrl={tour.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cruises;