'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TagIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import MobileNumberInput from '@/components/PhoneInput';

interface Cruise {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
    description?: string;
  };
  cruiseType: string;
  isFeatured: boolean;
  location: string;
  numberofDays: number;
  numberofNights: number;
  price: string;
  slug: string;
  startDate: string;
  status: string;
  videoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
  description?: string;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  userID?: string;
}

export default function CruiseDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking form state & handlers
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

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
            name: currentUser.displayName || '',
            email: currentUser.email || ''
          }));
        }
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const fetchCruise = async () => {
      if (!slug) return;

      try {
        const cruisesRef = collection(db, 'cruises');
        const q = query(cruisesRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data() as Cruise;
          setCruise({ ...data, id: docSnap.id });
        } else {
          setError('Cruise not found.');
        }
      } catch (err) {
        console.error('Error fetching cruise:', err);
        setError('Failed to load cruise details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCruise();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? 'Date not set'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch {
      return 'Date not set';
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const timestamp = Date.now();
      const bookingId = `PTID-${timestamp}`;
      
      // Fetch user document to get custom userID if set
      let storedUserData: Partial<UserData> = {};
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          storedUserData = userDoc.data() as UserData;
        }
      }

      const bookingData = {
        ...formData,
        cruiseId: cruise?.id,
        cruiseTitle: cruise?.title,
        category: cruise?.categoryDetails?.name,
        createdAt: serverTimestamp(),
        bookingId,
        // Save custom userID from the users collection if available; otherwise fallback
        userID: storedUserData.userID || user?.uid || null,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading cruise details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
        <p className="text-xl">⚠️ {error}</p>
        <button
          onClick={() => router.push('/cruises')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Cruises
        </button>
      </div>
    );
  }

 

  return (
    <>
      <Head>
        <title>{cruise.title} | Cruise Package</title>
        <meta name="description" content={cruise.description} />
      </Head>
      <div className="flex flex-col md:flex-row mt-24 max-w-7xl mx-auto p-4 gap-8">
        {/* Main Cruise Details */}
        <div className="md:w-2/3">
          <div className="mt-4">
            <Link href="/cruises" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all Cruises
            </Link>
          </div>
          <div className="mt-5">
            <h1 className="text-3xl font-bold text-gray-800">{cruise.title}</h1>
            {cruise.categoryDetails && (
              <Link href={`/cruises/${cruise.categoryDetails.slug}`}>
                <h2 className="text-blue-500 text-sm font-medium p-1 rounded-sm hover:text-blue-600 transition-colors duration-200">
                  {cruise.categoryDetails.name}
                </h2>
              </Link>
            )}
            <p className="text-gray-600 mt-2 max-w-3xl leading-relaxed">{cruise.description}</p>
            <div className="mt-6 relative h-96 w-full">
              <iframe
                src={cruise.imageURL}
                width="100%"
                height="100%"
                className="object-cover rounded-lg shadow-md"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-8 text-gray-800">Details</h1>
          <div className="m-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center">
              <CalendarIcon className="h-10 w-10 text-blue-500" />
              <div className="ml-2">
                <p className="text-lg">{cruise.numberofDays} Days / {cruise.numberofNights} Nights</p>
                <p className="text-sm text-gray-500">
                  {cruise.startDate ? `Start: ${formatDate(cruise.startDate)}` : 'Flexible dates'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-10 w-10 text-blue-500" />
              <p className="ml-2 text-lg">{cruise.location}</p>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-10 w-10 text-blue-500" />
              <div className="ml-2">
                <p className="text-lg font-semibold">{formatPrice(Number(cruise.price))}</p>
              </div>
            </div>
          </div>
          
          {cruise.videoURL && (
            <>
              <h2 className="mt-8 font-bold text-2xl text-gray-800">Video Of The Cruise</h2>
              <div className="flex justify-start items-center m-10">
                <iframe
                  width="560"
                  height="315"
                  src={cruise.videoURL}
                  title="YouTube video player"
                  frameBorder="0"
                  className="rounded-lg shadow-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </>
          )}
        </div>

        {/* Booking Form Sidebar */}
        <div className="md:w-1/3 space-y-6 mt-16">
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
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
                            onChange={(value) => setFormData({ ...formData, phone: value })}
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
                          onChange={(value) => setFormData({ ...formData, phone: value })}
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
        </div>
      </div>
    </>
  );
}