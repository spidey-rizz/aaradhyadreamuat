"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Calendar, ChevronRight, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            <span className="text-zinc-300 font-medium">Privacy Policy</span>
          </div>

          {/* Header */}
          <header className="mb-14 animate-fade-in-up delay-100 border-b border-zinc-900 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={12} />
              Privacy & Trust
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6">
              Privacy <span className="text-primary font-extrabold">Policy</span>
            </h1>
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-6">
              <Calendar size={14} className="text-primary" />
              <span>Last Updated: 01/07/2026</span>
            </div>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-3xl">
              At Aaradhya Dream City, your privacy is our top priority. We are committed to protecting your personal information and ensuring it is handled with absolute safety and confidentiality.
            </p>
          </header>

          {/* Point by Point Content (No Boxes/Cards) */}
          <div className="space-y-10 animate-fade-in-up delay-200">
            
            {/* 1. Strict No-Leak Policy */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                1. Strict Data Protection (No Leak Policy)
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>We implement advanced security and encryption measures to ensure that your personal and financial details are completely secure.</li>
                <li>Your data is hosted on secure databases with strict access controls to prevent any unauthorized leakage or cybersecurity threats.</li>
                <li>We guarantee that your personal information will never be leaked, sold, or shared with unauthorized third parties.</li>
              </ul>
            </section>

            {/* 2. Prevention of Misuse */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                2. No Misuse of Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>All details collected are strictly used for the transactional and booking purposes of Aaradhya Dream City.</li>
                <li>We do not use your contact information for spamming or marketing unrelated products.</li>
                <li>Access to your sensitive documents (like PAN/Aadhaar) is limited only to authorized personnel handling your verification.</li>
              </ul>
            </section>

            {/* 3. Safety & Verification Purpose */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                3. Safety & KYC Verification
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>Information is collected to verify customer identities to prevent financial fraud and fraudulent property claims.</li>
                <li>Verifying details ensures that the right plot is officially assigned to the correct buyer without legal disputes.</li>
                <li>This verification process is designed entirely for the legal safety of both the buyer and the developer.</li>
              </ul>
            </section>

            {/* 4. Record Maintenance */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                4. Official Record Keeping
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li>We maintain accurate digital records of plot sales, customer bookings, payment history, and associate referral levels.</li>
                <li>Maintaining these records helps us provide swift customer service, process commissions accurately, and issue receipts immediately.</li>
                <li>These records are safely stored to comply with national property laws and tax audits.</li>
              </ul>
            </section>

            {/* 5. What Data We Collect */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
                5. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 leading-relaxed">
                <li><strong className="text-white">Personal Identity:</strong> Name, phone number, address, and email.</li>
                <li><strong className="text-white">KYC Documents:</strong> PAN card or Aadhaar details solely for official booking verification.</li>
                <li><strong className="text-white">Financial Details:</strong> Payment transaction references, paid amount records, and pending dues tracking.</li>
              </ul>
            </section>

            {/* 6. Contact Information */}
            <section className="border-b border-zinc-900/60 pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary">
                6. Contact Our Privacy Team
              </h2>
              
              <div className="space-y-4 pl-2 text-zinc-400 leading-relaxed">
                <p className="font-bold text-white text-lg">Aaradhya Dream City Support</p>
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

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
