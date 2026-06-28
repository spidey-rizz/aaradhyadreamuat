import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estate | Premium Associate Network",
  description: "Join the most exclusive real estate Associate network in Aaradhya Dream City. Register, verify, and grow your referral network.",
  keywords: ["Real Estate", "Associate", "Aaradhya", "Referral Network", "Dream City"],
};

import { ThemeProvider } from "@/lib/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${playfair.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <Script id="error-interceptor" strategy="beforeInteractive">
          {`
            (function() {
              const ignoreErrors = [
                'Cannot redefine property: ethereum',
                'ethereum'
              ];
              
              function shouldIgnore(errorMsg, url) {
                if (!errorMsg) return false;
                const msg = errorMsg.toLowerCase();
                if (ignoreErrors.some(term => msg.includes(term.toLowerCase()))) {
                  return true;
                }
                if (url && (url.includes('chrome-extension://') || url.includes('moz-extension://'))) {
                  return true;
                }
                return false;
              }

              window.addEventListener('error', function(event) {
                const errorMsg = event.message || (event.error && event.error.message);
                const url = event.filename || (event.error && event.error.stack);
                if (shouldIgnore(errorMsg, url)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);

              window.addEventListener('unhandledrejection', function(event) {
                const errorMsg = event.reason && event.reason.message;
                const url = event.reason && event.reason.stack;
                if (shouldIgnore(errorMsg, url)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
