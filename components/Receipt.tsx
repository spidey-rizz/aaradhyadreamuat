import React from 'react';

export interface ReceiptData {
  receiptNo?: string;
  date?: string;
  plotNo?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  paymentMode?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  prepaid?: number;
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
    totalAmount,
    paidAmount,
    remainingAmount: apiRemainingAmount,
    prepaid,
  } = data;

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
    <div id="receipt-container" className="bg-white text-black p-8 max-w-[800px] mx-auto border border-gray-300 print:border-none print:p-0 font-sans text-sm md:text-base">
      
      {/* Header / Company Details */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Aaradhya Dream City</h1>
        <h2 className="text-xl font-semibold mb-2">Payment Receipt</h2>
        <div className="flex justify-center gap-4 text-sm mt-2">
          <p><span className="font-semibold">Contact:</span> +91 93356 02932</p>
          <p><span className="font-semibold">Email:</span> support@aaradhyadreamcity.in</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="flex justify-between mb-6">
        <div>
          {receiptNo && receiptNo !== 'Auto Generated' && (
            <p className="mb-1"><span className="font-semibold w-24 inline-block">Receipt No</span>: {receiptNo}</p>
          )}
          <p className="mb-1"><span className="font-semibold w-24 inline-block">Date</span>: {displayDate}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-lg"><span className="font-semibold">Plot No</span>: {plotNo || 'N/A'}</p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-6 border border-gray-300 p-4">
        <h3 className="text-lg font-bold bg-gray-100 p-2 -mx-4 -mt-4 mb-4 border-b border-gray-300">Customer Details</h3>
        <p className="mb-2"><span className="font-semibold w-32 inline-block">Name</span>: {customerName || 'N/A'}</p>
        <p className="mb-2"><span className="font-semibold w-32 inline-block">Phone</span>: {phone || 'N/A'}</p>
        <p className="mb-2"><span className="font-semibold w-32 inline-block">Address</span>: {address || 'N/A'}</p>
      </div>

      {/* Payment Details */}
      <div className="mb-8 border border-gray-300 p-4">
        <h3 className="text-lg font-bold bg-gray-100 p-2 -mx-4 -mt-4 mb-4 border-b border-gray-300">Payment Details</h3>
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 w-1/2">Payment Mode</th>
              <td className="py-3 px-2 font-medium">{paymentMode || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 w-1/2">Total Amount</th>
              <td className="py-3 px-2 font-medium">₹{parsedTotal.toLocaleString('en-IN')}</td>
            </tr>
            {parsedPrepaid > 0 && (
              <tr className="border-b border-gray-200">
                <th className="py-3 px-2 w-1/2">Prepaid Amount</th>
                <td className="py-3 px-2 font-medium">₹{parsedPrepaid.toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 w-1/2">Paid Amount</th>
              <td className="py-3 px-2 font-medium">₹{parsedPaid.toLocaleString('en-IN')}</td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <th className="py-3 px-2 w-1/2">Remaining Amount</th>
              <td className="py-3 px-2">₹{finalRemainingAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between mt-16 pt-8">
        <div className="text-center w-48 border-t border-black pt-2">
          <p className="font-semibold">Customer Signature</p>
        </div>
        <div className="text-center w-48 border-t border-black pt-2">
          <p className="font-semibold">Authorized Sign</p>
        </div>
      </div>
      
    </div>
  );
};
