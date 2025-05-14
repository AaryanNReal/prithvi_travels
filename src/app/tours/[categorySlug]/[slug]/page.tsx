// app/tours/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, auth } from '@/app/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc , serverTimestamp , setDoc} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, CurrencyRupeeIcon, TagIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import MobileNumberInput from '@/components/PhoneInput';
interface ItineraryDay {
  title: string;
  description: string;
  imageURL: string[];
}


interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
  description?: string;
}

interface Tag {
  name: string;
  slug: string;
  description?: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  location: string;
  price: number;
  numberofDays: number;
  numberofNights: number;
  startDate: string;
  itenaries: Record<string, ItineraryDay>;
  status?: string;
  categoryDetails: CategoryDetails;
  flightIncluded?: boolean;
  isFeatured?: boolean;
  isStartDate?: boolean;
  tourType?: string;
  tags?: Record<string, Tag>;
}

interface RelatedTour {
  id: string;
  title: string;
  slug: string;
  imageURL: string;
  price: number;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
}

export default function TourDetailPage() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedTours, setRelatedTours] = useState<RelatedTour[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [categories, setCategories] = useState<CategoryDetails[]>([]);

  const slug = decodeURIComponent(params.slug as string);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          setFormData(prev => ({
            ...prev,
            name: userDoc.data()?.name || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: userDoc.data()?.phone || ''
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            name: currentUser.displayName || ''
          }));
        }
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTourAndRelated = async () => {
      try {
        setLoading(true);
        const toursRef = collection(db, 'tours');
        const q = query(toursRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Tour not found');
          return;
        }

        const doc = querySnapshot.docs[0];
        const tourData = doc.data() as Tour;

        if (tourData.status && tourData.status !== 'active') {
          setError('Tour is not available');
          return;
        }

        setTour({
          ...tourData,
          id: doc.id
        });

        // Fetch related tours from the same category
        if (tourData.categoryDetails?.categoryID) {
          const relatedQuery = query(
            toursRef,
            where('categoryDetails.categoryID', '==', tourData.categoryDetails.categoryID),
            where('status', '==', 'active'),
            where('slug', '!=', slug)
          );
          const relatedSnapshot = await getDocs(relatedQuery);
          const related = relatedSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            slug: doc.data().slug,
            imageURL: doc.data().imageURL,
            price: doc.data().price
          }));
          setRelatedTours(related);
        }

        // Fetch all unique categories
        const allToursSnapshot = await getDocs(toursRef);
        const categoriesMap = new Map<string, CategoryDetails>();
        
        allToursSnapshot.forEach(tourDoc => {
          const tour = tourDoc.data() as Tour;
          if (tour.categoryDetails) {
            categoriesMap.set(tour.categoryDetails.categoryID, tour.categoryDetails);
          }
        });

        setCategories(Array.from(categoriesMap.values()));

      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Failed to load tour');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchTourAndRelated();
  }, [slug]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date not specified';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  userID?: string;
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const timestamp = Date.now();
    const bookingId = `PTID-${timestamp}`;

    // Fetch user document data from the 'users' collection
    let storedUserData: Partial<UserData> = {};
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        storedUserData = userDoc.data() as UserData;
      }
    }

    const bookingData = {
      ...formData,
      tourId: tour?.id,
      tourTitle: tour?.title,
      category: tour?.categoryDetails?.name,
      createdAt: serverTimestamp(),
      bookingId,
      // Use the custom userID from the users collection if available; otherwise, fallback to user.uid
      userID: storedUserData.userID || user?.uid || null,
      // Include user details for consistency:
      userName: storedUserData.name || formData.name || '',
      userEmail: storedUserData.email || formData.email || ''
    };

    await setDoc(doc(db, 'bookings', bookingId), bookingData);

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};




  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading tour details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
      <p className="text-xl">⚠️ {error}</p>
      <Link href="/tours" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Back to Tours
      </Link>
    </div>
  );

  if (!tour) return null;

  const dayKeys = Object.keys(tour.itenaries || {}).sort((a, b) => {
    const dayA = parseInt(a.replace('Day', ''));
    const dayB = parseInt(b.replace('Day', ''));
    return dayA - dayB;
  });

  const tagKeys = tour.tags ? Object.keys(tour.tags) : [];

  return (
    <div className="flex flex-col mt-24 md:flex-row gap-8 p-4 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="md:w-2/3">
        <div className="mt-4">
          <Link href="/tours" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all tours
          </Link>
        </div>
        
        <div className='mt-5'>
          <h1 className='text-3xl font-bold text-gray-800'>{tour.title}</h1>
          {tour.categoryDetails && (
            <Link href={`/tours/${tour.categoryDetails.slug}`}>
              <h1 className='text-blue-500 text-sm font-medium p-1 rounded-sm hover:text-blue-600 transition-colors duration-200'>{tour.categoryDetails.name}</h1>
            </Link>
          )}
          <p className='text-gray-600 mt-2 max-w-3xl leading-relaxed'>{tour.description}</p>
          <div className="mt-6 relative h-96 w-full">
            <iframe
              src={tour.imageURL}
              width="100%"
              height="100%"
              className="object-cover rounded-lg shadow-md"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
        
        <h1 className='text-2xl font-bold mt-8 text-gray-800'>Details</h1>
        <div className='m-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='flex items-center'>
              <CalendarIcon className='h-10 w-10 text-blue-500' />
              <div className='ml-2'>
                <p className='text-lg'>{tour.numberofDays} Days / {tour.numberofNights} Nights</p>
                <p className='text-sm text-gray-500'>
                  {tour.isStartDate ? `Start: ${formatDate(tour.startDate)}` : 'Flexible dates'}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <MapPinIcon className='h-10 w-10 text-blue-500' />
              <p className='ml-2 text-lg'>{tour.location}</p>
            </div>
            <div className='flex items-center'>
              <CurrencyRupeeIcon className='h-10 w-10 text-blue-500' />
              <div className='ml-2'>
                <p className='text-lg font-semibold'>{formatPrice(tour.price)}</p>
                {tour.flightIncluded && (
                  <p className='text-sm text-green-600'>Flight included</p>
                )}
              </div>
            </div>
          </div>
        </div>

        
        
        <h1 className='text-2xl font-bold mt-8 text-gray-800'>Tour Itinerary</h1>
        <div className='m-4'>
          <div className="space-y-6">
            {tour.itenaries && Object.keys(tour.itenaries).length > 0 ? (
              dayKeys.map((dayKey) => {
                const day = tour.itenaries[dayKey];
                const dayNumber = dayKey.replace('Day', '');
                
                return (
                  <div key={dayKey} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Day {dayNumber}: {day.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {day.description}
                    </p>
                    
                    {day.imageURL && day.imageURL.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {day.imageURL.map((img, idx) => (
                          <div key={idx} className="relative h-48 rounded-md overflow-hidden">
                            <Image
                              src={img}
                              alt={`Day ${dayNumber} Image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic">No itinerary details available for this tour.</p>
            )}
          </div>
        </div>
        {tagKeys.length > 0 && (
          <div className="m-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TagIcon className="h-6 w-6 text-blue-500 mr-2" />
              Tour Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {tagKeys.map((tagKey) => {
                const tag = tour.tags![tagKey];
                return (
                  <Link 
                    key={tagKey} 
                    href={`/tour-tags/${tag.slug}`}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {tag.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

       </div>
      
      {/* Sidebar */}
      <div className="md:w-1/3 space-y-6 mt-16">
       <div className="mt-12  bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Request More Information</h2>
          
          {formSubmitted ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              Thank you for your inquiry! We'll contact you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {loadingUser ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{formData.name || 'User'}</p>
                      <p className="text-sm text-gray-600">{formData.email}</p>
                      {formData.phone && <p className="text-sm text-gray-600">{formData.phone}</p>}
                    </div>
                  </div>
                  
                  {!userData?.phone && (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <MobileNumberInput 
  value={formData.phone}
  onChange={(value) => setFormData({...formData, phone: value})}
/>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
       <MobileNumberInput 
  value={formData.phone}
  onChange={(value) => setFormData({...formData, phone: value})}
/>
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  placeholder="Any specific questions or requirements?"
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  {user ? 'Request a Call Back' : 'Submit Inquiry'}
                </button>
              </div>
              
              {!user && (
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-blue-600 hover:text-blue-800">
                    Log in
                  </Link>
                </p>
              )}
            </form>
          )}
        </div>
      
        {relatedTours.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Related Tours</h3>
            <div className="space-y-4">
              {relatedTours.map((tour) => (
                <Link 
                  key={tour.id} 
                  href={`/tours/${tour.slug}`}
                  className="flex items-start space-x-4 group"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={tour.imageURL}
                      alt={tour.title}
                      fill
                      className="object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {tour.title}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium">{formatPrice(tour.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tour Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.categoryID}>
                <Link 
                  href={`/tours/${category.slug}`} 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}