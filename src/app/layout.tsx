"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";
import "./globals.css";
import { SearchProvider } from "@/context/searchProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Routes where sidebar should not be shown
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Check if current path is an auth route or the home page
  const isAuthRoute = pathname === '/' || authRoutes.some(route => pathname?.startsWith(route));
  
  return (
    <html lang="en">
      <head>
        <title>Nexus - Evidence Management</title>
        <meta name="description" content="Evidence Management System" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster richColors position="top-right" />
        
        {isAuthRoute ? (
          // Auth routes - no sidebar or header
          <>{children}</>
        ) : (
          <SearchProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">
                  {/* Reduced top padding here */}
                  <div className="container mx-auto pt-3 px-6 pb-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </SearchProvider>
        )}
      </body>
    </html>
  );
}