'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const HelpDesk = () => {
  const [formData, setFormData] = useState({
    category: 'General Inquiry',
    description: '',
    attachmentURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Check auth state on component mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        toast.info('Please login to submit a help desk ticket', {
          position: "top-center",
          autoClose: 3000,
        });
        router.push('/signup'); // Redirect to login page if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTicketID = () => {
    const timestamp = Date.now().toString();
    return `HID${timestamp.slice(-8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a ticket', {
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      const ticketId = generateTicketID();
      const ticketRef = doc(db, 'helpdesk', ticketId);
      
      await setDoc(ticketRef, {
        // Ticket details
        ...formData,
        ticketID: ticketId,
        status: 'open',
        
        // User details
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        
        // System fields
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setFormData({
        category: 'General Inquiry',
        description: '',
        attachmentURL: ''
      });

      toast.success('Your ticket has been submitted successfully!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error submitting ticket: ', error);
      toast.error('Failed to submit your ticket. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Help Desk Ticket
            </h2>
            <p className="mb-8 text-base font-medium text-body-color dark:text-body-color-dark">
              Submit your issue and our team will assist you shortly.
            </p>
            
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-dark dark:text-white mb-2"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-stroke bg-[#f8f8f8] px-4 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Account Problem">Account Problem</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-dark dark:text-white mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Please describe your issue in detail"
                    required
                    className="w-full rounded-md border border-stroke bg-[#f8f8f8] px-4 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="attachmentURL"
                    className="block text-sm font-medium text-dark dark:text-white mb-2"
                  >
                    Attachment URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="attachmentURL"
                    value={formData.attachmentURL}
                    onChange={handleChange}
                    placeholder="Paste a link to any supporting documents or screenshots"
                    className="w-full rounded-md border border-stroke bg-[#f8f8f8] px-4 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-md bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpDesk;