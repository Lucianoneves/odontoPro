import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionAuthProvider } from "@/components/session-auth"; 
import { Toaster } from "sonner";
import { QueryClientContext } from "@/providers/queryclient";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OdontoPro",
  description: "OdontoPro  é uma plataforma de gerenciamento de clínica odontológica",
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  openGraph: { 
    title: "OdontoPro",
    description: "OdontoPro  é uma plataforma de gerenciamento de clínica odontológica",     
    images: [`${process.env.NEXT_PUBLIC_URL}/doctor-hero.png`]
     
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionAuthProvider>
          <QueryClientContext>
            <Toaster   
             duration={2500} 
             />        
            {children}
          </QueryClientContext>          
        </SessionAuthProvider>
      </body>
    </html>
  );
}
