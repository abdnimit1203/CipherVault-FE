import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from 'nextjs-toploader';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CipherVault by ABD",
  description: "Your digital life, cryptographically secured with zero-knowledge AES-256.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0b1728",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} antialiased`} suppressHydrationWarning>
        <NextTopLoader color="#38bdf8" showSpinner={false} />
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
