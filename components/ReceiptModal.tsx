"use client";

import React, { useRef, useState } from "react";
import { Receipt, ReceiptData } from "./Receipt";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { X, Printer, Download, Loader2 } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const generatePdfDocument = async () => {
    if (!printRef.current) return null;
    
    const element = printRef.current;
    
    // Clone the element to render it outside the scrollable container.
    // This prevents html2canvas from cutting off the image at the visible screen boundary.
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    clone.style.left = "0";
    clone.style.width = `${element.offsetWidth}px`;
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.transform = "none";
    
    document.body.appendChild(clone);
    
    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8; // 8mm margin
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      let renderWidth = printableWidth;
      let renderHeight = (canvas.height * printableWidth) / canvas.width;

      // Ensure content strictly fits within a single A4 page
      if (renderHeight > printableHeight) {
        const scaleFactor = printableHeight / renderHeight;
        renderHeight = printableHeight;
        renderWidth = renderWidth * scaleFactor;
      }

      const xOffset = margin + (printableWidth - renderWidth) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight);

      return pdf;
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handlePrint = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = await generatePdfDocument();
      if (!pdf) return;
      
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      if (typeof window !== "undefined" && (window as any)._activePrintBlobUrl) {
        URL.revokeObjectURL((window as any)._activePrintBlobUrl);
      }
      if (typeof window !== "undefined") {
        (window as any)._activePrintBlobUrl = blobUrl;
      }

      let iframe = document.getElementById("print-pdf-iframe") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "print-pdf-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
      }
      
      iframe.src = blobUrl;
      
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    } catch (err) {
      console.error("Error printing PDF", err);
      alert("Failed to load print preview. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = await generatePdfDocument();
      if (!pdf) return;
      
      pdf.save(`Receipt-${data?.plotNo || "Plot"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      alert("Failed to generate PDF. Please try printing instead.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Dynamic Style Injection for Perfect Printing */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          /* Hide all screen elements */
          body * {
            visibility: hidden;
          }
          /* Show only the receipt container and its descendants */
          #receipt-container, #receipt-container * {
            visibility: visible !important;
          }
          #receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h3 className="font-black uppercase tracking-wider text-sm text-primary">Payment Receipt</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content wrapper */}
        <div className="flex-grow overflow-y-auto p-6 bg-zinc-950">
          {/* Action Buttons */}
          <div className="mb-6 flex justify-end gap-3">
            <button
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 text-zinc-100 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-primary" />
              Print Receipt
            </button>
            
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-colors hover:scale-[1.01] active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
          </div>

          {/* Wrapper for printing and canvas capture */}
          <div ref={printRef} className="bg-white rounded-2xl overflow-hidden shadow-md">
            <Receipt data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
