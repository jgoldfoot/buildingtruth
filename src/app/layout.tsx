import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildingTruth — SF Landlord Transparency Index",
  description:
    "San Francisco landlord transparency index powered by public data. Know your landlord before you sign the lease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0F1117] text-[#F1F5F9] font-[family-name:var(--font-inter)]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
