import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./components/Auth/Auth";
import ClientRoot from "./components/lib/ClientRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oni Project",
  description: "Built by s-uryansh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ClientRoot>
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          {children}
        </AuthProvider>
      </ClientRoot>
      </body>
    </html>
  );
}
