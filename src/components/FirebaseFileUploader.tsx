'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface FirebaseFileUploaderProps {
  storagePath?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess?: (downloadUrl: string) => void;
  onUploadStart?: () => void;
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
  buttonText = 'Upload',
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
      onUploadSuccess?.(url);
    } catch (err) {
      console.error('Upload failed:', err);
      const error = err as Error;
      setError('Upload failed. Please try again.');
      onUploadError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setDownloadUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md text-sm space-y-2 p-3 border rounded-md shadow-sm bg-white">
      <label className="block font-medium text-gray-700">Upload a file</label>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        accept={accept}
        disabled={disabled || uploading}
        className="block w-full text-xs text-gray-500
          file:mr-2 file:py-1 file:px-2
          file:rounded file:border-0
          file:bg-blue-100 file:text-blue-700
          hover:file:bg-blue-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {file && (
        <div className="text-xs text-gray-700">
          Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={disabled || uploading || !file}
        className={`w-full py-1.5 px-3 text-xs font-medium rounded-md text-white ${
          disabled || uploading || !file
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {uploading ? 'Uploading...' : buttonText}
      </button>

      {error && <div className="text-red-600 text-xs">{error}</div>}

      {downloadUrl && (
        <div className="mt-2 text-xs bg-green-50 p-2 rounded-md">
          <p className="text-green-700 mb-1">Upload successful!</p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View or download file
          </a>
          <button
            onClick={handleRemove}
            className="ml-2 text-red-600 underline hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};
