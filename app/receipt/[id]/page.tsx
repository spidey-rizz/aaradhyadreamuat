'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Receipt, ReceiptData } from '@/components/Receipt';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Printer, Download, AlertCircle, Loader2 } from 'lucide-react';

export default function ReceiptPage() {
  const params = useParams();
  const { id } = params as { id: string };

  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        setLoading(true);
        // Replace with the exact API endpoint based on your backend documentation
        // Example: https://api.aaradhyadreamcity.in/api/bookings/{id}
        const res = await fetch(`https://api.aaradhyadreamcity.in/api/v1/bookings/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch receipt data');
        }

        const json = await res.json();
        
        // Map the backend response to our generic ReceiptData interface.
        // Adjust these fields based on the actual API response keys.
        const receiptData: ReceiptData = {
          receiptNo: json.data?.receiptNo || json.data?._id,
          date: json.data?.date || json.data?.createdAt,
          plotNo: json.data?.plotNo || json.data?.plot?.plotNumber,
          customerName: json.data?.customerName || json.data?.customer?.name,
          phone: json.data?.phone || json.data?.customer?.phone,
          address: json.data?.address || json.data?.customer?.address,
          paymentMode: json.data?.paymentMode,
          totalAmount: json.data?.totalAmount,
          paidAmount: json.data?.paidAmount,
          remainingAmount: json.data?.remainingAmount,
        };

        setData(receiptData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching the receipt.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReceiptData();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;

    try {
      setIsGeneratingPdf(true);
      const element = receiptRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt-${data?.plotNo || id}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF. Please try printing instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading receipt details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center max-w-md w-full shadow-sm border border-red-100">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p>{error || 'Receipt data not found.'}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Action Buttons - Hidden when printing */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-end gap-4 print:hidden">
        <button
          onClick={handlePrint}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
        
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Printable Receipt Wrapper */}
      <div ref={receiptRef} className="shadow-lg print:shadow-none bg-white">
        <Receipt data={data} />
      </div>
    </div>
  );
}
