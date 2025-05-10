'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FirebaseFileUploader } from '@/components/FirebaseFileUploader';

interface Ticket {
  id: string;
  helpdeskID: string;
  category: string;
  status: 'Opened' | 'Resolved' | 'Reopened' | 'Closed';
  createdAt: any;
  updatedAt?: any;
  responses: {
    opened: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    resolved?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    reopened?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    closed?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
  };
  userDetails: {
    name: string;
    email: string;
    phone: string;
    uid: string;
    userID: string;
  };
}

const HelpDeskPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState('Account Related');
  const [description, setDescription] = useState('');

  // Check auth state and fetch tickets
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchTickets();
      } else {
        router.push('/signup');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'helpdesk'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ticketList: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ticketList.push({
          id: doc.id,
          helpdeskID: data.helpdeskID,
          category: data.category,
          status: data.status || 'Opened',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          responses: data.responses || {
            opened: {
              response: data.description || '',
              attachmentURL: data.attachmentURL || '',
              createdAt: data.createdAt
            }
          },
          userDetails: data.userDetails || {
            name: '',
            email: '',
            phone: '',
            uid: '',
            userID: ''
          }
        });
      });
      
      setTickets(ticketList);
    } catch (error) {
      console.error('Error fetching tickets: ', error);
      alert('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const generateTicketID = () => {
    const timestamp = Date.now().toString();
    return `HID${timestamp.slice(-8)}`;
  };

  const generateUserID = () => {
    return `UID${Math.floor(Date.now() / 1000)}`;
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategory('Account Related');
    setDescription('');
    setAttachmentUrl(null);
  };

  const handleUploadSuccess = (url: string) => {
    setAttachmentUrl(url);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to submit a ticket');
      return;
    }

    if (!description) {
      alert('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const ticketId = generateTicketID();
      const userId = generateUserID();
      const ticketRef = doc(db, 'helpdesk', ticketId);
      
      const ticketData = {
        category: category,
        createdAt: serverTimestamp(),
        helpdeskID: ticketId,
        responses: {
          opened: {
            attachmentURL: attachmentUrl || "",
            createdAt: serverTimestamp(),
            response: description
          }
        },
        status: "Opened",
        updatedAt: serverTimestamp(),
        userDetails: {
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          uid: user.uid,
          userID: userId
        }
      };

      await setDoc(ticketRef, ticketData);
      alert('Ticket created successfully!');
      closeModal();
      await fetchTickets();
    } catch (error) {
      console.error('Error creating ticket: ', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Opened': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Reopened': return 'bg-orange-100 text-orange-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="container mx-auto mt-34 px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Help Desk Tickets</h1>
          <button
            onClick={showModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Ticket
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Message</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.helpdeskID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{ticket.helpdeskID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{ticket.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {ticket.userDetails.name} ({ticket.userDetails.email})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {ticket.responses.opened.response}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Create New Ticket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Account Related">Account Related</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Support">Billing Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your issue in detail"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Attachment
                </label>
                <FirebaseFileUploader
                  storagePath="helpdesk-attachments"
                  accept="image/*,.pdf,.doc,.docx"
                  maxSizeMB={5}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  buttonText="Upload Attachment"
                />
                {attachmentUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    File uploaded successfully!
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!description || loading}
                  className={`px-4 py-2 rounded-md text-white ${!description || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskPage;