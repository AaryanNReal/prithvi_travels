"use client";
import React, { useState, useEffect } from "react";

// Country data with image placeholders
const countries = [
  { name: "India", image: "/api/placeholder/800/600" },
  { name: "USA", image: "/api/placeholder/800/600" },
  { name: "Canada", image: "/api/placeholder/800/600" },
  { name: "Australia", image: "/api/placeholder/800/600" },
  { name: "Germany", image: "/api/placeholder/800/600" },
  { name: "France", image: "/api/placeholder/800/600" },
  { name: "Japan", image: "/api/placeholder/800/600" },
  { name: "Brazil", image: "/api/placeholder/800/600" },
  { name: "South Africa", image: "/api/placeholder/800/600" },
];

const Brands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(3); // Default to 3 items per page
  const autoPlayInterval = 3000; // 3 seconds

  // Adjust itemsPerPage based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1); // 1 item for small screens
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // 2 items for medium screens
      } else {
        setItemsPerPage(3); // 3 items for large screens
      }
    };

    updateItemsPerPage(); // Set initial value
    window.addEventListener("resize", updateItemsPerPage); // Update on resize

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(countries.length / itemsPerPage);

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < countries.length && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex + itemsPerPage);
    } else if (currentIndex + itemsPerPage >= countries.length && !isAnimating) {
      // Loop back to first slide when reaching the end
      setIsAnimating(true);
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex - itemsPerPage >= 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  // Reset animation flag after transition completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Auto play functionality
  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, currentIndex, isAnimating]);

  // Calculate current page for indicator
  const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "url(/images/video/shape.svg)", // Ensure this file exists
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            height: "100%", // Ensure height is defined
          }}
        ></div>

        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Our Global Presence
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore our services across these countries
            </p>
          </div>

          <div
            className="relative max-w-5xl mx-auto"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            {/* Slider Container */}
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)`,
                }}
              >
                {countries.map((country, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-3"
                    style={{ flexBasis: `${100 / itemsPerPage}%` }}
                  >
                    <div className="relative h-64 bg-white rounded-lg shadow-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden group">
                      {/* Background image */}
                      <img
                        src={country.image}
                        alt={`${country.name} backdrop`}
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-300"
                      />
                      {/* Dark overlay for better text readability */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                      {/* Country name */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {country.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              disabled={currentIndex === 0 || isAnimating}
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              disabled={currentIndex + itemsPerPage >= countries.length || isAnimating}
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Page Indicator */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
                  index + 1 === currentPage
                    ? "bg-gray-800 dark:bg-white w-6"
                    : "bg-gray-400 dark:bg-gray-500"
                }`}
              ></div>
            ))}
          </div>

          {/* Current items indicator */}
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {currentIndex + 1}-{Math.min(currentIndex + itemsPerPage, countries.length)} of {countries.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;