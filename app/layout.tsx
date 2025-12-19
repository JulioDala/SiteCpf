import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
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
  title: "Portal Cliente - CCPF",
  description: "Portal do Cliente CCPF - agendamento, suporte e serviços.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
