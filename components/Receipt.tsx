import React from 'react';
import { COMPANY_INFO } from '@/lib/company';

export interface ReceiptData {
  receiptNo?: string;
  date?: string;
  plotNo?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  paymentMode?: string;
  marketPrice?: number;
  discountPercent?: number;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  prepaid?: number;
  metadata?: {
    upi_id?: string;
    rtgs_id?: string;
    cheque_no?: string;
    bank_name?: string;
    branch_name?: string;
    account_number?: string;
    ifsc_code?: string;
    payment_type?: string;
  };
}

interface ReceiptProps {
  data: ReceiptData;
}

export const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  const {
    receiptNo,
    date,
    plotNo,
    customerName,
    phone,
    address,
    paymentMode,
    marketPrice,
    discountPercent,
    totalAmount,
    paidAmount,
    remainingAmount: apiRemainingAmount,
    prepaid,
    metadata,
  } = data;

  const parsedMarketPrice = Number(marketPrice) || 0;
  const parsedDiscountPercent = Number(discountPercent) || 0;
  const parsedTotal = Number(totalAmount) || 0;
  const parsedPaid = Number(paidAmount) || 0;
  const parsedPrepaid = Number(prepaid) || 0;
  
  // Calculate remaining amount if not provided by the API, accounting for prepaid
  const finalRemainingAmount =
    apiRemainingAmount !== undefined && apiRemainingAmount !== null
      ? Number(apiRemainingAmount)
      : parsedPrepaid > 0
        ? Math.max(0, parsedTotal - (parsedPrepaid + parsedPaid))
        : parsedTotal - parsedPaid;

  const displayDate = date ? new Date(date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  return (
    <div
      id="receipt-container"
      className="bg-white text-gray-900 p-5 max-w-[700px] mx-auto border border-gray-300 print:border-none print:p-0 font-sans text-xs"
    >
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          #receipt-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      
      {/* Header / Company Details */}
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          {COMPANY_INFO.logoUrl && (
            <img src={COMPANY_INFO.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
          )}
          <h1 className="text-xl font-bold uppercase tracking-wider text-black">{COMPANY_INFO.name}</h1>
        </div>
        <p className="text-[10.5px] text-gray-600 max-w-xl mx-auto mb-1 leading-snug">
          {COMPANY_INFO.fullAddress}
        </p>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-gray-700 font-medium mb-2">
          <p><span className="font-semibold text-black">Contact:</span> {COMPANY_INFO.phone}</p>
          <p><span className="font-semibold text-black">Email:</span> {COMPANY_INFO.email}</p>
          <p><span className="font-semibold text-black">Website:</span> {COMPANY_INFO.website.replace('https://', '')}</p>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 bg-gray-100 py-0.5 px-3 inline-block rounded border border-gray-300">
          Payment Receipt
        </h2>
      </div>

      {/* Basic Info Bar */}
      <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded px-3 py-1.5 mb-2.5 text-xs">
        <div className="flex gap-4">
          {receiptNo && receiptNo !== 'Auto Generated' && (
            <p><span className="font-semibold text-gray-600">Receipt No:</span> <span className="font-bold text-black">{receiptNo}</span></p>
          )}
          <p><span className="font-semibold text-gray-600">Date:</span> <span className="font-medium text-black">{displayDate}</span></p>
        </div>
        <div>
          <p className="text-xs">
            <span className="font-semibold text-gray-600 mr-1.5">Plot No:</span>
            <span className="font-bold bg-white border border-gray-300 px-2 py-0.5 rounded text-black">{plotNo || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-2.5 border border-gray-300 rounded overflow-hidden">
        <h3 className="text-[11px] font-bold bg-gray-100 px-3 py-1 border-b border-gray-300 uppercase tracking-wider text-gray-800">
          Customer Details
        </h3>
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Customer Name</span>
            <span className="font-semibold text-gray-900">{customerName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Phone</span>
            <span className="font-medium text-gray-900">{phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Address</span>
            <span className="font-medium text-gray-800">{address || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-3 border border-gray-300 rounded overflow-hidden">
        <h3 className="text-[11px] font-bold bg-gray-100 px-3 py-1 border-b border-gray-300 uppercase tracking-wider text-gray-800">
          Payment Details
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Payment Mode</th>
              <td className="py-1.5 px-3 font-medium">{paymentMode || 'N/A'}</td>
            </tr>
            {metadata?.upi_id && metadata.upi_id !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">UPI ID</th>
                <td className="py-1.5 px-3 font-medium">{metadata.upi_id}</td>
              </tr>
            )}
            {metadata?.rtgs_id && metadata.rtgs_id !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">RTGS / Reference ID</th>
                <td className="py-1.5 px-3 font-medium">{metadata.rtgs_id}</td>
              </tr>
            )}
            {metadata?.cheque_no && metadata.cheque_no !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Cheque No.</th>
                <td className="py-1.5 px-3 font-medium">{metadata.cheque_no}</td>
              </tr>
            )}
            {metadata?.bank_name && metadata.bank_name !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Bank Name</th>
                <td className="py-1.5 px-3 font-medium">{metadata.bank_name}</td>
              </tr>
            )}
            {metadata?.branch_name && metadata.branch_name !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Branch Name</th>
                <td className="py-1.5 px-3 font-medium">{metadata.branch_name}</td>
              </tr>
            )}
            {metadata?.account_number && metadata.account_number !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Account Number</th>
                <td className="py-1.5 px-3 font-medium">{metadata.account_number}</td>
              </tr>
            )}
            {metadata?.ifsc_code && metadata.ifsc_code !== 'n/a' && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">IFSC Code</th>
                <td className="py-1.5 px-3 font-medium">{metadata.ifsc_code}</td>
              </tr>
            )}
            {parsedMarketPrice > 0 && parsedMarketPrice > parsedTotal && (
              <>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Market Price</th>
                  <td className="py-1.5 px-3 font-medium line-through text-gray-500">₹{parsedMarketPrice.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Discount</th>
                  <td className="py-1.5 px-3 font-medium text-emerald-600">
                    {parsedDiscountPercent > 0 ? `${parsedDiscountPercent}%` : `${(((parsedMarketPrice - parsedTotal) / parsedMarketPrice) * 100).toFixed(0)}%`}
                  </td>
                </tr>
              </>
            )}
            <tr className="border-b border-gray-200">
              <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Total Amount</th>
              <td className="py-1.5 px-3 font-bold text-gray-900">₹{parsedTotal.toLocaleString('en-IN')}</td>
            </tr>
            {parsedPrepaid > 0 && (
              <tr className="border-b border-gray-200">
                <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Prepaid Amount</th>
                <td className="py-1.5 px-3 font-semibold text-gray-900">₹{parsedPrepaid.toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr className="border-b border-gray-200">
              <th className="py-1.5 px-3 font-semibold text-gray-700 w-1/2">Paid Amount</th>
              <td className="py-1.5 px-3 font-bold text-emerald-700">₹{parsedPaid.toLocaleString('en-IN')}</td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <th className="py-1.5 px-3 text-gray-900 w-1/2">Remaining Amount</th>
              <td className="py-1.5 px-3 text-red-600">₹{finalRemainingAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mt-6 pb-2 px-4">
        <div className="w-36 text-center border-t border-black pt-1">
          <p className="font-semibold text-[11px]">Customer Signature</p>
        </div>
        <div className="w-52 text-center">
          <p className="font-bold text-[11px] mb-8 text-gray-800">For {COMPANY_INFO.name}</p>
          <div className="border-t border-black pt-1">
            <p className="font-semibold text-[11px]">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-[9.5px] text-gray-400 mt-3">
        * This is a computer generated receipt and does not require physical stamp unless specified.
      </p>
    </div>
  );
};
