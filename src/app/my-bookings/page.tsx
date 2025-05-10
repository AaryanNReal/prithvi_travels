'use client';
import { useState } from 'react';

interface Booking {
  id: string;
  bookingID: string;
  serviceType: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  bookingDate: string;
  bookingTime: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes: string;
}

const BookingPage = () => {
  // Mock data
  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingID: 'BK001',
      serviceType: 'Deep Cleaning',
      status: 'Confirmed',
      bookingDate: '2023-06-15',
      bookingTime: '10:00 AM',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      },
      notes: '2 bedrooms, 1 bathroom'
    },
    {
      id: '2',
      bookingID: 'BK002',
      serviceType: 'Regular Maintenance',
      status: 'Pending',
      bookingDate: '2023-06-16',
      bookingTime: '2:00 PM',
      customer: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-987-6543'
      },
      notes: 'Monthly service'
    },
    {
      id: '3',
      bookingID: 'BK003',
      serviceType: 'Move-In Cleaning',
      status: 'Completed',
      bookingDate: '2023-06-10',
      bookingTime: '9:00 AM',
      customer: {
        name: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '555-456-7890'
      },
      notes: 'New apartment cleaning before move-in'
    },
    {
      id: '4',
      bookingID: 'BK004',
      serviceType: 'Office Cleaning',
      status: 'Cancelled',
      bookingDate: '2023-06-12',
      bookingTime: '4:00 PM',
      customer: {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        phone: '555-789-0123'
      },
      notes: 'Cancelled due to scheduling conflict'
    }
  ];

  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState('Deep Cleaning');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setServiceType('Deep Cleaning');
    setBookingDate('');
    setBookingTime('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
  };

  const generateBookingID = () => {
    const nextId = bookings.length + 1;
    return `BK${nextId.toString().padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const newBooking: Booking = {
        id: (bookings.length + 1).toString(),
        bookingID: generateBookingID(),
        serviceType,
        status: 'Pending',
        bookingDate,
        bookingTime,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        notes
      };

      setBookings([newBooking, ...bookings]);
      setLoading(false);
      closeModal();
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto mt-20 px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Service Bookings</h1>
          <button
            onClick={showModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Booking
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.bookingID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{booking.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {booking.bookingDate} at {booking.bookingTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <div>{booking.customer.name}</div>
                      <div className="text-sm text-gray-500">{booking.customer.email}</div>
                      <div className="text-sm text-gray-500">{booking.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs">
                      {booking.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Create New Booking</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceType">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Regular Maintenance">Regular Maintenance</option>
                    <option value="Move-In Cleaning">Move-In Cleaning</option>
                    <option value="Office Cleaning">Office Cleaning</option>
                    <option value="Carpet Cleaning">Carpet Cleaning</option>
                    <option value="Window Cleaning">Window Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bookingDate">
                    Date
                  </label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bookingTime">
                    Time
                  </label>
                  <select
                    id="bookingTime"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerPhone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerEmail">
                    Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special instructions or details about the service..."
                />
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
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;