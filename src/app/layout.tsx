import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/context/AuthContext";
import { VaultProvider } from "@/context/VaultContext";
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
  metadataBase: new URL("https://abd-ciphervault.netlify.app"),
  title: {
    default: "ABD-CipherVault — Zero-Knowledge Password Manager by Abdullah Ibne Ali",
    template: "%s | ABD-CipherVault"
  },
  description: "ABD-CipherVault is a zero-knowledge, client-side encrypted password manager built by Abdullah Ibne Ali (ABD NIMIT). Secure your credentials with AES-256-GCM encryption, PBKDF2 key derivation, and modern glassmorphism UI.",
  keywords: [
    "ABD-CipherVault",
    "CipherVault",
    "Abdullah Ibne Ali",
    "ABD NIMIT",
    "Abdullah Ibne Ali Portfolio",
    "Zero Knowledge Password Manager",
    "Encrypted Vault",
    "AES-256 Encryption",
    "Password Generator",
    "Security Vault",
    "Netlify Password Manager",
    "Web Application Developer"
  ],
  authors: [
    { name: "Abdullah Ibne Ali (ABD NIMIT)", url: "https://abdullah-portfolio-frontend.netlify.app/" }
  ],
  creator: "Abdullah Ibne Ali",
  publisher: "Abdullah Ibne Ali",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abd-ciphervault.netlify.app",
    title: "ABD-CipherVault — Zero-Knowledge Password Manager by Abdullah Ibne Ali",
    description: "Client-side encrypted password manager built by Abdullah Ibne Ali. Your passwords are encrypted locally with zero-knowledge AES-256 security.",
    siteName: "ABD-CipherVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "ABD-CipherVault — Zero-Knowledge Password Manager by Abdullah Ibne Ali",
    description: "Client-side encrypted password manager built by Abdullah Ibne Ali.",
  },
  alternates: {
    canonical: "https://abd-ciphervault.netlify.app"
  }
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
          <VaultProvider>
            <AppLayout>{children}</AppLayout>
          </VaultProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
