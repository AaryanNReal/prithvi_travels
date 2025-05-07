"use client";
import React, { useState, useEffect } from "react";

// Country data with local flag images from public folder
const countries = [
  { name: "India", image: "/images/flags/india.png" },
  { name: "USA", image: "/images/flags/usa.png" },
  { name: "Canada", image: "/images/flags/canada.png" },
  { name: "Australia", image: "/images/flags/australia.png" },
  { name: "Germany", image: "/images/flags/germany.png" },
  { name: "France", image: "/images/flags/france.png" },
  { name: "Japan", image: "/images/flags/japan.png" },
  { name: "Brazil", image: "/images/flags/brazil.png" },
  { name: "South Africa", image: "/images/flags/south-africa.png" },
];

const Brands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Default to 4 items per page
  const autoPlayInterval = 2000; // 5 seconds

  // Adjust itemsPerPage based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1); // 1 item for small screens
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // 2 items for medium screens
      } else {
        setItemsPerPage(4); // 4 items for large screens
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: "url(/images/video/shape.svg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            height: "100%",
          }}
        ></div>

        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our Global Presence
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our services across these countries and discover how we're making a difference worldwide
            </p>
          </div>

          <div
            className="relative max-w-6xl mx-auto"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            {/* Slider Container */}
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)`,
                }}
              >
                {countries.map((country, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-4"
                    style={{ flexBasis: `${100 / itemsPerPage}%` }}
                  >
                    <div className="relative h-72 bg-white rounded-xl shadow-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-8px] overflow-hidden group">
                      {/* Flag image with gradient overlay */}
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                        <img
                          src={country.image}
                          alt={`${country.name} flag`}
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      
                      {/* Country name with animated reveal */}
                      <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="bg-gradient-to-t from-blue-600 to-blue-500 p-4">
                          <h3 className="text-2xl font-bold text-white text-center">
                            {country.name}
                          </h3>
                          <p className="text-blue-100 text-center text-sm mt-1">Explore our services</p>
                        </div>
                      </div>
                      
                      {/* Hover effect border */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-xl transition-colors duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Indicator */}
          <div className="flex justify-center mt-10">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setCurrentIndex(index * itemsPerPage);
                }}
                className={`w-3 h-3 mx-2 rounded-full transition-all duration-300 ${
                  index + 1 === currentPage
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-blue-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              ></button>
            ))}
          </div>

          {/* Current items indicator */}
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Displaying {currentIndex + 1}-{Math.min(currentIndex + itemsPerPage, countries.length)} of {countries.length} countries
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;