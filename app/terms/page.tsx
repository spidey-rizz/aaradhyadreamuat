"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Calendar, CheckCircle2, ChevronRight, Phone, Mail, MapPin, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TermsAndConditionsPage() {
  const [declared, setDeclared] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white noise-overlay relative overflow-hidden">
      <Navbar />

      {/* Subtle Gold Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Main Content Area - Golden Ratio vertical padding */}
      <main className="flex-grow pt-[8.5rem] pb-[5.5rem] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-8 animate-fade-in-up">
            <Link href="/" className="hover:text-primary transition-colors duration-200">Home</Link>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className="text-zinc-300 font-medium">Terms & Conditions</span>
          </div>

          {/* Header */}
          <header className="mb-14 animate-fade-in-up delay-100 border-b border-zinc-900 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Award size={12} />
              Agreement
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6">
              Terms & <span className="text-primary font-extrabold">Conditions</span>
            </h1>
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-6">
              <Calendar size={14} className="text-primary" />
              <span>Last Updated: 01/07/2026</span>
            </div>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-3xl">
              Welcome to Aaradhya Dream City. By accessing our website and booking any plot, you agree to the following Terms & Conditions.
            </p>
          </header>

          {/* Simple Point by Point Content (No Boxes/Cards) */}
          <div className="space-y-10 animate-fade-in-up delay-200">
            
            {/* 1. Booking */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                1. Booking
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>A booking is considered valid only after the required booking amount has been received and acknowledged by Aaradhya Dream City.</li>
                <li>Booking is subject to verification of customer details and document submission.</li>
                <li>The Company reserves the right to accept or reject any booking request.</li>
              </ul>
            </section>

            {/* 2. Plot Availability */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                2. Plot Availability
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>Plot availability is subject to real-time inventory.</li>
                <li>If a selected plot is unavailable, the Company may offer an alternative plot or refund the booking amount according to Company policy.</li>
              </ul>
            </section>

            {/* 3. Payment */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                3. Payment
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>All payments must be made through Company-approved payment methods.</li>
                <li>The buyer is responsible for paying the agreed amount within the specified payment schedule.</li>
                <li>Delayed payments may attract penalties or additional charges as per Company policy.</li>
              </ul>
            </section>

            {/* 4. Booking Amount */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                4. Booking Amount
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>The booking amount shall be adjusted against the final sale consideration.</li>
                <li>Booking confirmation does not automatically transfer ownership of the plot.</li>
              </ul>
            </section>

            {/* 5. Cancellation & Refund */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                5. Cancellation & Refund
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>Cancellation requests must be submitted in writing.</li>
                <li>Refunds, if applicable, shall be processed according to the Company's cancellation policy.</li>
                <li>Any applicable deductions, administrative charges, or cancellation fees may be deducted before processing the refund.</li>
              </ul>
            </section>

            {/* 6. Registration & Possession */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                6. Registration & Possession
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>Property registration will be initiated only after the buyer clears all outstanding dues.</li>
                <li>Registration charges, stamp duty, government fees, taxes, and other statutory charges shall be borne by the buyer unless otherwise agreed in writing.</li>
                <li>Possession shall be provided after completion of all contractual and payment obligations.</li>
              </ul>
            </section>

            {/* 7. Taxes & Government Charges */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                7. Taxes & Government Charges
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>GST (if applicable), stamp duty, registration charges, and other government taxes shall be payable by the buyer as per applicable laws.</li>
              </ul>
            </section>

            {/* 8. Customer Information */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                8. Customer Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>The buyer is responsible for providing accurate personal information.</li>
                <li>Any incorrect information may delay booking, registration, or documentation.</li>
              </ul>
            </section>

            {/* 9. Modification of Terms */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                9. Modification of Terms
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>Aaradhya Dream City reserves the right to modify, update, or revise these Terms & Conditions at any time without prior notice.</li>
                <li>The latest version published on the website shall apply.</li>
              </ul>
            </section>

            {/* 10. Limitation of Liability */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                10. Limitation of Liability
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>The Company shall not be responsible for delays caused by government authorities, natural disasters, legal restrictions, force majeure events, or circumstances beyond its reasonable control.</li>
              </ul>
            </section>

            {/* 11. Intellectual Property */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                11. Intellectual Property
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>All content available on this website, including text, images, logos, graphics, and branding, is the property of Aaradhya Dream City and may not be copied, reproduced, or distributed without prior written permission.</li>
              </ul>
            </section>

            {/* 12. Governing Law & Jurisdiction */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                12. Governing Law & Jurisdiction
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>These Terms & Conditions shall be governed by the laws of India.</li>
                <li>Any dispute arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in Varanasi, Uttar Pradesh.</li>
              </ul>
            </section>

            {/* 13. Contact Information */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary">
                13. Contact Information
              </h2>
              
              <div className="space-y-4 pl-2 text-zinc-400 leading-relaxed">
                <p className="font-bold text-white text-lg">Aaradhya Dream City</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary shrink-0" size={18} />
                    <span>Phone: +91 93356 02932</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary shrink-0" size={18} />
                    <span>Email: <a href="mailto:support@aaradhyadreamcity.in" className="hover:text-primary transition-colors">support@aaradhyadreamcity.in</a></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary shrink-0" size={18} />
                    <span>Location: Varanasi, Uttar Pradesh</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Declaration */}
            <section className="pt-8">
              <div className="border border-zinc-800 rounded-3xl p-6 sm:p-8 bg-zinc-950/40">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-primary" size={20} />
                  Customer Declaration
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  I hereby declare that I have carefully read, understood, and agreed to all the Terms & Conditions of Aaradhya Dream City before making any booking or payment. I confirm that the information provided by me is true and accurate to the best of my knowledge.
                </p>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={declared}
                    onChange={(e) => setDeclared(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-800 text-primary focus:ring-primary focus:ring-offset-black bg-zinc-900" 
                  />
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                    I acknowledge and accept the terms of the agreement.
                  </span>
                </label>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
