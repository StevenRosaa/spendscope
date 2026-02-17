import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendScope | AI Expense Automation",
  description: "Automate your expenses with AI precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 antialiased transition-colors duration-300`}>
        {/* Avvolgi tutto nel ThemeProvider */}
        <ThemeProvider> 
          <AuthProvider>
            <Header />
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}