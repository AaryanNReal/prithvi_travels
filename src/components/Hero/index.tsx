'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Slide {
  imageUrl: string;
  screenName: string;
  altText?: string;
}

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch slider images from Firestore
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const docRef = doc(db, 'sliderImages', 'homeCarousel');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Assuming the images are stored in an array field
          const slideData = (data.images || []).map((slide: any) => ({
            imageUrl: slide.imageUrl || '',
            screenName: slide.screenName || '/', // Default to home
            altText: slide.altText || `Slide`
          })).filter((slide: Slide) => slide.imageUrl); // Only keep valid slides

          setSlides(slideData);
        } else {
          setError('Home carousel document not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching slider images:', err);
        setError('Failed to load slider images');
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  // Navigation handlers
  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full mt-22 h-[calc(100vh-96px)] overflow-hidden">
      {/* Image Slider */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          </div>
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
            <p className="mb-4 text-xl font-medium text-red-500">Error loading images</p>
            <p className="text-center text-gray-500">{error}</p>
          </div>
        ) : slides.length > 0 ? (
          <div className="relative h-full w-full">
            {slides.map((slide, index) => (
              <div
                key={`${slide.imageUrl}-${index}`}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Link href={slide.screenName} className="block h-full w-full">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.altText || `Carousel slide ${index + 1}`}
                    fill
                    className="object-cover w-full h-full cursor-pointer"
                    priority={index === 0}
                    unoptimized // Recommended for external URLs
                    onError={(e) => {
                      console.error(`Error loading image: ${slide.imageUrl}`);
                      e.currentTarget.src = '/fallback-image.jpg';
                    }}
                  />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <p className="text-xl font-medium text-gray-500">No slider images available</p>
          </div>
        )}

        {/* Slider controls */}
        {!loading && !error && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/50"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/50"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 bg-primary' : 'bg-white/50'
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