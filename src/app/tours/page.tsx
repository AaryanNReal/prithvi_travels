// app/tours/page.tsx
"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import TourCard from "@/components//Domestic/TourCard";
import { useEffect, useState } from "react";

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursSnapshot = await getDocs(collection(db, "tours"));
        const toursData = toursSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tour[];
        setTours(toursData);
        setError(null);
      } catch (err) {
        console.error("Error fetching tours:", err);
        setError("Failed to load tours. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 mt-22
     sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Tour Packages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover amazing destinations with our carefully curated tours
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading tours...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tours Grid */}
        {!loading && !error && (
          <>
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour) => (
                  <TourCard key={tour.id} {...tour} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  No tours available at the moment. Please check back later.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}