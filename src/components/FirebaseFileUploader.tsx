// components/FirebaseFileUploader.tsx
'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface FirebaseFileUploaderProps {
  storagePath?: string; // Custom storage path (default: 'uploads')
  accept?: string; // File types to accept (default: all)
  maxSizeMB?: number; // Maximum file size in MB
  onUploadSuccess?: (downloadUrl: string) => void;
  onUploadError?: (error: Error) => void;
  buttonText?: string;
  disabled?: boolean;
}

const secondaryFirebaseConfig = {
  apiKey: "AIzaSyDsLezwK8WE2rVAY_fxUBfyEt5rpSH0ZE0",
  authDomain: "foodweb-world.firebaseapp.com",
  projectId: "foodweb-world",
  storageBucket: "foodweb-world.firebasestorage.app",
  messagingSenderId: "766590226062",
  appId: "1:766590226062:web:acd3a01063bccd15cb03df",
};

const SECONDARY_APP_NAME = 'secondaryApp';
const secondaryApp = getApps().find(app => app.name === SECONDARY_APP_NAME) || 
                    initializeApp(secondaryFirebaseConfig, SECONDARY_APP_NAME);
const secondaryStorage = getStorage(secondaryApp);

export const FirebaseFileUploader = ({
  storagePath = 'uploads',
  accept = '*',
  maxSizeMB = 10,
  onUploadSuccess,
  onUploadError,
  buttonText = 'Upload File',
  disabled = false,
}: FirebaseFileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setDownloadUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `file_${timestamp}.${fileExtension}`;
      const storageRef = ref(secondaryStorage, `${storagePath}/${filename}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setDownloadUrl(url);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      if (onUploadSuccess) onUploadSuccess(url);
    } catch (err) {
      console.error('Upload failed:', err);
      const error = err as Error;
      setError('Upload failed. Please try again.');
      if (onUploadError) onUploadError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a file to upload
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={accept}
          disabled={disabled || uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {maxSizeMB && (
          <p className="mt-1 text-xs text-gray-500">
            Max file size: {maxSizeMB}MB
          </p>
        )}
      </div>

      {file && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-700">
            Selected file: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={disabled || uploading || !file}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          disabled || uploading || !file ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {uploading ? 'Uploading...' : buttonText}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {downloadUrl && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-sm font-medium text-green-800 mb-2">Upload Successful!</h3>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-500 underline"
          >
            View or Download File
          </a>
          
        </div>
      )}
    </div>
  );
};