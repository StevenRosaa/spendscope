import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased`}>
        <AuthProvider>
          <Header />
          {/* Aggiungiamo un padding superiore per compensare l'Header fisso */}
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}