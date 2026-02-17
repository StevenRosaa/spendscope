'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Calls the FastAPI endpoint we built in Phase 3
      await apiClient.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        ) : (
          <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        )}
        
        {isUploading ? (
          <p className="text-gray-600 font-medium">Uploading to secure storage...</p>
        ) : (
          <div>
            <p className="text-gray-700 font-medium">Drag & drop your receipt here</p>
            <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, and PDF</p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}