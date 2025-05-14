'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, where, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FirebaseFileUploader } from '@/components/FirebaseFileUploader';

interface Ticket {
  id: string;
  helpdeskID: string;
  category: string;
  status: 'Opened' | 'Resolved' | 'Reopened' | 'Closed' | 'PendingClosure';
  createdAt: any;
  resolvedAt?: any;
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState('Account Related');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    category: '',
    description: '',
    form: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/signup');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch tickets and check for pending closures
  useEffect(() => {
    if (user) {
      fetchTickets();
      const interval = setInterval(() => checkPendingClosures(), 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  // Validate form
  useEffect(() => {
    if (isSubmitted) {
      validateForm();
    }
  }, [category, description, isSubmitted]);

  const validateForm = () => {
    const newErrors = {
      category: '',
      description: '',
      form: ''
    };

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!description) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return !newErrors.category && !newErrors.description;
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'helpdesk'),
        where('userDetails.uid', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
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
          resolvedAt: data.resolvedAt,
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
      setErrorMessage('Failed to fetch tickets');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingClosures = async () => {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const q = query(
        collection(db, 'helpdesk'),
        where('status', '==', 'Resolved'),
        where('resolvedAt', '<=', threeDaysAgo)
      );

      const querySnapshot = await getDocs(q);
      const batchUpdates: Promise<void>[] = [];

      querySnapshot.forEach((doc) => {
        const ticketRef = doc.ref;
        batchUpdates.push(
          updateDoc(ticketRef, {
            status: 'Closed',
            updatedAt: serverTimestamp(),
            responses: {
              ...doc.data().responses,
              closed: {
                response: 'Ticket automatically closed after 3 days of resolution',
                createdAt: serverTimestamp()
              }
            }
          })
        );
      });

      await Promise.all(batchUpdates);
      if (batchUpdates.length > 0) {
        await fetchTickets(); // Refresh tickets if any were closed
      }
    } catch (error) {
      console.error('Error checking pending closures:', error);
    }
  };

  const generateTicketID = () => {
    const timestamp = Date.now().toString();
    return `HID${timestamp.slice(-8)}`;
  };

  
 

  const showModal = () => {
    setIsModalOpen(true);
    setIsSubmitted(false);
    setErrors({
      category: '',
      description: '',
      form: ''
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategory('Account Related');
    setDescription('');
    setAttachmentUrl(null);
    setIsSubmitted(false);
    setErrors({
      category: '',
      description: '',
      form: ''
    });
  };

  const showTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
  };

  const handleUploadSuccess = (url: string) => {
    setAttachmentUrl(url);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    setErrorMessage('File upload failed. Please try again.');
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!user) {
      setErrorMessage('You must be logged in to submit a ticket');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const ticketId = generateTicketID();
      let fetchedUserID = "";
       const usersQuery = query(
    collection(db, "users"),
    where("uid", "==", user.uid)
  );
  const usersSnapshot = await getDocs(usersQuery);
  if (!usersSnapshot.empty) {
    fetchedUserID = usersSnapshot.docs[0].data().userID;
  }
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
          userID: fetchedUserID
        }
      };

      await setDoc(ticketRef, ticketData);
      setSuccessMessage('Ticket created successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      closeModal();
      await fetchTickets();
    } catch (error) {
      console.error('Error creating ticket: ', error);
      setErrorMessage('Failed to create ticket. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to reopen this ticket?')) return;
    
    setLoading(true);
    try {
      const ticketRef = doc(db, 'helpdesk', ticketId);
      
      await updateDoc(ticketRef, {
        status: "Reopened",
        updatedAt: serverTimestamp(),
        responses: {
          ...tickets.find(t => t.id === ticketId)?.responses,
          reopened: {
            response: "Ticket reopened by user",
            createdAt: serverTimestamp()
          }
        }
      });

      setSuccessMessage('Ticket reopened successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      await fetchTickets();
    } catch (error) {
      console.error('Error reopening ticket: ', error);
      setErrorMessage('Failed to reopen ticket');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
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
      case 'PendingClosure': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (resolvedAt: any) => {
    if (!resolvedAt) return '';
    const resolvedDate = resolvedAt.toDate();
    const closureDate = new Date(resolvedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > closureDate) return 'Closed soon';
    
    const diff = closureDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Closes in ${hours}h ${minutes}m`;
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleString();
    }
    return date;
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
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-lg flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-md shadow-lg flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Help Desk Tickets</h1>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <div className="flex items-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        {ticket.status === 'Resolved' && ticket.resolvedAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            {getTimeRemaining(ticket.resolvedAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {ticket.responses.opened.response}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                          <button
                            onClick={() => handleReopenTicket(ticket.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => showTicketDetails(ticket)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b px-6 py-1">
              <h2 className="text-xl font-semibold text-gray-800">Create New Ticket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4" noValidate>
              <div className="mb-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-1 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Account Related">Account Related</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Support">Billing Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Describe your issue in detail (minimum 10 characters)"
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <div className="text-right text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1">
                  Attachment (Optional)
                </label>
                <FirebaseFileUploader
  storagePath="helpdesk-attachments"  // Custom storage path in Firebase
  accept=".pdf,.doc,.docx,.jpg,.png"  // Specific file types
  maxSizeMB={15}  // 15MB file size limit
  disabled={false}  // Enable/disable the uploader
  onUploadStart={() => console.log('Upload started')}
  onUploadSuccess={(url, type) => {
    console.log('Upload success! URL:', url);
    console.log('File type:', type);
    // Update your state or database here
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
    // Show error message to user
  }}
/>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>

              {errors.form && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {errors.form}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Overlay */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Ticket Details</h2>
              <button
                onClick={closeTicketDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ticket ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.helpdeskID}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.createdAt)}</p>
                </div>
                {selectedTicket.resolvedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resolved At</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.resolvedAt)}</p>
                  </div>
                )}
                {selectedTicket.updatedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Initial Message</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.opened.response}</p>
                  {selectedTicket.responses.opened.attachmentURL && (
                    <div className="mt-2">
                      <a 
                        href={selectedTicket.responses.opened.attachmentURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {selectedTicket.responses.resolved && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Resolution Response</h3>
                  <div className="mt-1 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.resolved.response}</p>
                    {selectedTicket.responses.resolved.attachmentURL && (
                      <div className="mt-2">
                        <a 
                          href={selectedTicket.responses.resolved.attachmentURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTicket.responses.reopened && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Reopened Response</h3>
                  <div className="mt-1 p-3 bg-orange-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.reopened.response}</p>
                  </div>
                </div>
              )}

              {selectedTicket.responses.closed && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Closure Response</h3>
                  <div className="mt-1 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.closed.response}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed') && (
                  <button
                    onClick={() => {
                      closeTicketDetails();
                      handleReopenTicket(selectedTicket.id);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskPage;