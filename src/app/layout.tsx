import type { Metadata } from "next";
import PrivyProvider from "@/components/PrivyProvider";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Inter } from 'next/font/google';

import localFont from 'next/font/local'
import WelcomeSlideshow from "@/components/onboarding/WelcomeSlideshow";
import HeaderAd from "@/components/HeaderAd";
import NavBar from "@/components/NavBar";
import MarketTrends from "@/components/MarketTrends";
import TokenSwapCard from "@/components/TokenSwapCard";
import { Dialog } from "@/components/ui/dialog";

const grotesqueArabicPro = localFont({
  src: './fonts/BasisGrotesqueArabicPro-Regular.woff2',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CTO Marketplace",
  description: "Where Memecoins go to live again",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${grotesqueArabicPro.className} antialiased`}>
        <PrivyProvider>
          <Dialog>
              <HeaderAd />
              <NavBar />
              <MarketTrends />
              {children}
              <WelcomeSlideshow />
              <div className="fixed bottom-15 right-20 z-50">
                <TokenSwapCard />
              </div>
          </Dialog>
        </PrivyProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </body>
    </html>
  );
}
