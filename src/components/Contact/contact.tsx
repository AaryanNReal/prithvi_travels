'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseFileUploader } from '@/components/FirebaseFileUploader';
import MobileNumberInput from '@/components/PhoneInput';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    phone: '',
    subject: 'General Inquiry',
    status: 'pending',
    attachmentURL: ''
  });

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage('');
        setPopupType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadSuccess = (downloadURL: string) => {
    setFormData(prev => ({
      ...prev,
      attachmentURL: downloadURL
    }));
    setIsUploading(false);
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setFormData(prev => ({
      ...prev,
      attachmentURL: ''
    }));
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setPopupType('error');
    setPopupMessage(`File upload failed: ${error.message}`);
    setIsUploading(false);
  };

  const generateQueryID = () => {
    const timestamp = Date.now().toString();
    return `QID${timestamp.slice(-6)}`;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isUploading) {
      setPopupType('error');
      setPopupMessage('Please wait for file upload to complete');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      setPopupType('error');
      setPopupMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const queryId = generateQueryID();
      const queryRef = doc(db, 'queries', queryId);

      await setDoc(queryRef, {
        ...formData,
        queryID: queryId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFormData({
        name: '',
        email: '',
        message: '',
        phone: '',
        subject: 'General Inquiry',
        status: 'pending',
        attachmentURL: ''
      });

      setPopupType('success');
      setPopupMessage('Your query has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      setPopupType('error');
      setPopupMessage('Failed to submit your query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="flex items-center justify-center min-h-screen py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="mb-12 rounded-xs bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:px-8 xl:p-[55px]">
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl text-center">
                Need Help? Open a Ticket
              </h2>
              <p className="mb-12 text-base font-medium text-body-color text-center">
                Our support team will get back to you ASAP via email.
              </p>

              {popupMessage && (
                <div
                  className={`mb-6 text-center rounded-md px-4 py-3 text-sm font-medium ${
                    popupType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {popupMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="name" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="email" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3"
                      />
                    </div>
                  </div>

                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="phone" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Phone
                      </label>
                      <MobileNumberInput
                        value={formData.phone}
                        onChange={(value) => {
                          handleChange({ target: { name: 'phone', value } });
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="subject" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing Question">Billing Question</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Attachment
                      </label>
                      <FirebaseFileUploader
                        storagePath="queries"
                        maxSizeMB={5}
                        onUploadStart={handleUploadStart}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                        disabled={isUploading}
                      />
                      {formData.attachmentURL && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xs">
                          
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label htmlFor="message" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Enter your Message"
                        required
                        className="border-stroke w-full resize-none rounded-xs border bg-[#f8f8f8] px-6 py-3"
                      ></textarea>
                    </div>
                  </div>

                  <div className="w-full px-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || isUploading}
                      className={`rounded-xs bg-primary px-9 py-4 text-base font-medium text-white ${
                        loading || isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
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
      </div>
    </section>
  );
};

export default Contact;
