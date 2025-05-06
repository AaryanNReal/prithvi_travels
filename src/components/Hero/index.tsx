'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase configuration and initialization
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyBmmVS6bpeMW9UyYMPHV7yOczlid7krb00",
      authDomain: "pruthvi-travels-6d10a.firebaseapp.com",
      projectId: "pruthvi-travels-6d10a",
      storageBucket: "pruthvi-travels-6d10a.appspot.com",
      messagingSenderId: "1066483473483",
      appId: "1:1066483473483:web:07ec9b6e61fcd1f6c001ce",
      measurementId: "G-YCEVPRPPZH",
    };

    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const mediaCollection = collection(db, "media");

      // Fetch data from Firestore
      getDocs(mediaCollection)
        .then((querySnapshot) => {
          const slideData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            image: doc.data().image, // Assuming 'image' contains the URL
            alt: doc.data().name || `Slide ${doc.id}`, // Use 'name' as alt text
          }));
          setSlides(slideData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching media from Firestore:", err);
          setError("Failed to load images.");
          setLoading(false);
        });
    } catch (err) {
      console.error("Error initializing Firebase:", err);
      setError("Failed to initialize Firebase.");
      setLoading(false);
    }
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  // Navigation handlers
  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative mt-24 h-[calc(100vh-96px)] w-screen overflow-hidden"> {/* Adjusted height */}
      {/* Image Slider */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          </div>
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="mb-4 text-xl font-medium text-red-500">Error loading images</p>
            <p className="text-center text-gray-500">{error}</p>
          </div>
        ) : slides.length > 0 ? (
          <div className="relative h-full w-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transform transition-all duration-500 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-contain" // Ensures the whole image is visible
                  priority={index === 0}
                  unoptimized={true}
                  onError={(e) => {
                    console.error(`Error loading image: ${slide.image}`);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">No images available</p>
          </div>
        )}

        {/* Slider controls */}
        {!loading && !error && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/50"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-black backdrop-blur-sm transition-all hover:bg-white/50"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3  rounded-full transition-all ${
                    index === currentSlide ? "w-8 bg-primary" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;