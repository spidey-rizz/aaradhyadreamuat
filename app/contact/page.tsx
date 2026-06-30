"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    option: "Buy a Plot",
    message: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.fullName.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your full name.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setStatus("error");
      setErrorMessage("Please enter a valid 10-digit Indian phone number starting with 6-9.");
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.option) {
      setStatus("error");
      setErrorMessage("Please select an option.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // API Jaga / Placeholder: Put Google Sheets script URL here
      // You can define this in your .env.local file as: NEXT_PUBLIC_GOOGLE_SHEET_URL=your_url
      const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || "";

      if (!googleSheetUrl) {
        // Fallback simulate success for UI demo if no script URL is configured yet
        console.warn("Google Sheet Script URL is not set. Simulating API submission.");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStatus("success");
        return;
      }

      const response = await fetch(googleSheetUrl, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script Web Apps in CORS environment
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      // Since mode is "no-cors", we won't get full response status, but if it doesn't throw, it appended successfully.
      setStatus("success");
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        option: "Buy a Plot",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <main className="relative pt-24 pb-20 md:py-32">
        {/* Soft Decorative Ambient Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight mb-4">
              Let&apos;s Build Your <span className="text-primary italic">Dreams</span>
            </h1>
            <p className="text-muted-foreground font-light leading-relaxed">
              Have questions about plots, flats, duplex homes, or joining our Associate network? Connect with our expert advisors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Info Cards (Left) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight uppercase">Contact Information</h2>
                <p className="text-muted-foreground font-light">
                  Feel free to visit our head office or call us directly. Our team is available from Mon - Sat (9:30 AM - 7:00 PM).
                </p>
              </div>

              {/* Grid of contact details */}
              <div className="space-y-6">

                {/* Phone Card */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Call Us</h4>
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">
                      <a href="tel:+919876543210">+91 93356 02932</a>
                    </p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Email Us</h4>
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">
                      <a href="mailto:support@aaradhyadreamcity.in" suppressHydrationWarning>support@aaradhyadreamcity.in</a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>Support: support@aaradhyadreamcity.in</p>
                  </div>
                </div>

                {/* Office Location Card */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Our Office</h4>
                    <p className="font-semibold text-foreground leading-relaxed">
                      Aaradhya Dream City Head Office,
                      <span className="block text-sm text-muted-foreground font-light mt-1">
                        S-2/638, Club Road, Cantonment, Varanasi, Uttar Pradesh - 221002
                      </span>
                    </p>
                  </div>
                </div>

                {/* Working Hours Card */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Working Hours</h4>
                    <p className="font-semibold text-foreground">Monday - Saturday</p>
                    <p className="text-xs text-muted-foreground mt-0.5">09:30 AM to 07:00 PM (IST)</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Form Card (Right) */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-8 shadow-lg shadow-black/[0.02] relative overflow-hidden">

              {/* Submission State: Success */}
              {status === "success" && (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6 shadow-sm shadow-emerald-500/5">
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground font-light max-w-sm mb-8 leading-relaxed">
                    Thank you for reaching out to Aaradhya Dream City. Your details have been successfully saved, and our team will connect with you soon.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-xs font-black uppercase tracking-wider hover:bg-foreground/[0.03] transition-all"
                  >
                    Send Another Message
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Submission State: Normal Form / Loading / Error */}
              {status !== "success" && (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Dynamic Alert Banner for error state */}
                  {status === "error" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="shrink-0 mt-0.5" size={18} />
                      <div className="text-xs font-semibold">
                        <span className="font-black uppercase tracking-wider block mb-0.5">Error</span>
                        {errorMessage}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Full Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={status === "loading"}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-colors disabled:opacity-50"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Phone Number <span className="text-primary">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={status === "loading"}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-colors disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Email Address <span className="text-xs text-muted-foreground/60">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={status === "loading"}
                        placeholder="example@mail.com"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-colors disabled:opacity-50"
                      />
                    </div>

                    {/* Options Dropdown */}
                    <div className="space-y-2">
                      <label htmlFor="option" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        I am interested in <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="option"
                          name="option"
                          value={formData.option}
                          onChange={handleChange}
                          disabled={status === "loading"}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-colors disabled:opacity-50 appearance-none cursor-pointer"
                        >
                          <option value="Buy a Plot">Buying a Plot</option>
                          <option value="Buy a House/Flat">Buying a House / Flat</option>
                          <option value="Become an Associate">Becoming an Associate</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Message / Notes <span className="text-xs text-muted-foreground/60">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      placeholder="Tell us more about your budget, preferred area, or questions..."
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-colors disabled:opacity-50 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-primary text-black rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Submitting Lead...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <Send size={14} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground/70 leading-relaxed max-w-md mx-auto mt-4">
                    By submitting, you agree to allow Aaradhya Dream City representatives to contact you via Phone / WhatsApp.
                  </p>

                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
