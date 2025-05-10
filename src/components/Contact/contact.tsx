'use client';
import { useState } from 'react';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const handleChange = (e) => {
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
    // Clear previous attachment URL when starting new upload
    setFormData(prev => ({
      ...prev,
      attachmentURL: ''
    }));
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    toast.error(`File upload failed: ${error.message}`);
    setIsUploading(false);
  };

  const generateQueryID = () => {
    const timestamp = Date.now().toString();
    return `QID${timestamp.slice(-6)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isUploading) {
      toast.error('Please wait for file upload to complete');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
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

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        phone: '',
        subject: 'General Inquiry',
        status: 'pending',
        attachmentURL: ''
      });

      toast.success('Your query has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit your query. Please try again.');
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
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
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
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
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
      // Update your form data state
      handleChange({
        target: {
          name: 'phone',
          value: value
        }
      });
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
                        className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
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
                        
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                        disabled={isUploading}
                      />
                      {formData.attachmentURL && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xs">
                          <p className="text-sm text-green-600 dark:text-green-400">
                            File uploaded successfully!
                          </p>
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
                        className="border-stroke w-full resize-none rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      ></textarea>
                    </div>
                  </div>
                  <div className="w-full px-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || isUploading}
                      className={`rounded-xs bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark ${(loading || isUploading) ? 'opacity-70 cursor-not-allowed' : ''}`}
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