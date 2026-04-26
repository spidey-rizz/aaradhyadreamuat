"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-zinc-300 font-medium">Privacy Policy</span>
          </div>

          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Shield size={12} />
              Trust & Security
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6">Privacy <span className="text-primary">Policy</span></h1>
            <p className="text-zinc-400 text-lg">Last Updated: April 26, 2026</p>
          </header>

          <div className="space-y-12">
            
            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Eye className="text-primary" />
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>We collect personal information that you provide directly to us when you register as an Associate, investor, or homebuyer. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Personal Identifiers:</strong> Name, address, phone number, email address, and Aadhaar/PAN details for verification.</li>
                  <li><strong className="text-white">Account Credentials:</strong> Passwords and security verification tokens.</li>
                  <li><strong className="text-white">Financial Information:</strong> Bank account details for commission payouts and transaction history.</li>
                  <li><strong className="text-white">Network Data:</strong> Referral codes and associate hierarchy data.</li>
                </ul>
              </div>
            </section>

            <section className="p-4 sm:p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <FileText className="text-primary" />
                2. How We Use Your Data
              </h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>Aaradhya Dream City uses the collected data for various purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our Service, including user authentication and verification.</li>
                  <li>To manage Associate commissions and referral network tracking.</li>
                  <li>To communicate with you via WhatsApp, Email, or Phone regarding updates and services.</li>
                  <li>To comply with legal obligations and regulatory requirements in the real estate sector.</li>
                  <li>To monitor the usage of our Service and detect, prevent, and address technical issues.</li>
                </ul>
              </div>
            </section>

            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Lock className="text-primary" />
                3. Data Security & Retention
              </h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>The security of your data is important to us. We implement industry-standard encryption and security measures to protect your personal information from unauthorized access.</p>
                <p>We retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws).</p>
              </div>
            </section>

            <section className="p-4 sm:p-8 border-l-2 border-primary/20">
              <h2 className="text-xl font-bold mb-4">4. Third-Party Sharing</h2>
              <p className="text-zinc-400 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except for verified third-party service providers who assist us in operating our website, conducting our business (like WhatsApp API services), or servicing you, so long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-4">5. Your Rights</h2>
              <p className="text-zinc-400 leading-relaxed">
                You have the right to access, update, or delete the personal information we have on you. If you are unable to perform these actions yourself within your account settings, please contact us to assist you.
              </p>
            </section>

            <section className="pt-10 border-t border-zinc-900">
              <h2 className="text-xl font-bold mb-4">6. Contact Us</h2>
              <p className="text-zinc-400 mb-4">
                If you have any questions about this Privacy Policy, you can contact our privacy officer:
              </p>
              <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                <p className="text-white font-bold">Aaradhya Dream City Privacy Team</p>
                <p className="text-zinc-500">Email: support@aaradhyadreamcity.in</p>
                <p className="text-zinc-500">Varanasi, Uttar Pradesh, India</p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
