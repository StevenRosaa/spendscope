'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Important: Tell Axios we are expecting binary data (a Blob)
      const response = await apiClient.get('/analytics/export/csv', {
        responseType: 'blob',
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create an invisible <a> element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      // The name of the file that will be downloaded
      link.setAttribute('download', 'spendscope_expenses.csv');
      
      // Append to body, click it, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to download the report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{isExporting ? 'Generating CSV...' : 'Export to CSV'}</span>
    </button>
  );
}