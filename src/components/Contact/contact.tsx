'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseFileUploader } from '@/components/FirebaseFileUploader';
import MobileNumberInput from '@/components/PhoneInput';

interface QueryData {
  name: string;
  email: string;
  message: string;
  phone: string;
  subject: string;
  status: string;
  attachmentURL: string;
  userID: string;
  userId: string; // Firebase UID
  queryID: string;
  createdAt: any;
  updatedAt: any;
}

export default function ContactPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState({
    auth: true,
    submit: false,
    upload: false
  });
  const [notification, setNotification] = useState({
    message: '',
    type: '' as 'success' | 'error' | ''
  });
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    phone: '',
    subject: 'General Inquiry',
    attachmentURL: '',
    userID: ''
  });

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setForm({
              name: data.name || user.displayName || '',
              email: user.email || '',
              phone: data.phone || '',
              message: '',
              subject: 'General Inquiry',
              attachmentURL: '',
              userID: data.userID // Store the custom userID
            });
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      } else {
      
      }
      setLoading(prev => ({ ...prev, auth: false }));
    });

    return () => unsubscribe();
  }, [router]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadStart = () => {
    setLoading(prev => ({ ...prev, upload: true }));
    setForm(prev => ({ ...prev, attachmentURL: '' }));
  };

  const handleUploadSuccess = (url: string) => {
    setForm(prev => ({ ...prev, attachmentURL: url }));
    setLoading(prev => ({ ...prev, upload: false }));
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    setNotification({
      message: `Upload failed: ${error.message}`,
      type: 'error'
    });
    setLoading(prev => ({ ...prev, upload: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setNotification({
        message: 'Please sign in to submit a ticket',
        type: 'error'
      });
      return;
    }

    if (loading.upload) {
      setNotification({
        message: 'Please wait for file upload to complete',
        type: 'error'
      });
      return;
    }

    if (!form.name || !form.email || !form.message) {
      setNotification({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));

    try {
      const queryId = `QID${Date.now().toString().slice(-6)}`;
      const queryData: QueryData = {
        ...form,
        userId: user.uid,
        userID: userData?.userID || '', // Your custom userID
        queryID: queryId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'queries', queryId), queryData);

      setForm(prev => ({
        ...prev,
        message: '',
        subject: 'General Inquiry',
        attachmentURL: ''
      }));

      setNotification({
        message: 'Ticket submitted successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setNotification({
        message: 'Failed to submit ticket. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  if (loading.auth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to signup...</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Contact Support</h2>
          
          {notification.message && (
            <div className={`mb-6 p-4 rounded-md ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Phone</label>
                <MobileNumberInput
                  value={form.phone}
                  onChange={(value) => setForm(prev => ({ ...prev, phone: value }))}
                />
              </div>

              <div>
                <label className="block mb-2">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                >
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2">Attachment</label>
              <FirebaseFileUploader
                storagePath="queries"
                maxSizeMB={5}
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                disabled={loading.upload}
              />
            </div>

            <div>
              <label className="block mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full p-3 border rounded"
              />
            </div>

            <button
              type="submit"
              disabled={loading.submit || loading.upload}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-70"
            >
              {loading.submit ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}