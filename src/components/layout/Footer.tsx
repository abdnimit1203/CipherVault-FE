"use client";

import Link from "next/link";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background border-t border-border/50 py-8 flex flex-col items-center justify-center w-full gap-5 mt-auto relative z-10">
      <div className="text-sm text-muted-foreground text-center">
        Developed by{" "}
        <Link
          href="https://abdullah-portfolio-frontend.netlify.app/"
          target="_blank"
          className="font-bold text-primary hover:text-primary/80 transition"
        >
          ABD NIMIT
        </Link>{" "}
        | © {currentYear} - All rights reserved
      </div>
      
      <div className="flex gap-5 text-muted-foreground">
        <Link href="https://www.facebook.com/abd.nimit" target="_blank" className="hover:text-primary hover:scale-110 transition-all duration-300">
          <FaFacebook className="w-5 h-5" />
        </Link>
        <Link href="https://www.instagram.com/abd_nimit" target="_blank" className="hover:text-primary hover:scale-110 transition-all duration-300">
          <FaInstagram className="w-5 h-5" />
        </Link>
        <Link href="https://github.com/abdnimit1203" target="_blank" className="hover:text-primary hover:scale-110 transition-all duration-300">
          <FaGithub className="w-5 h-5" />
        </Link>
        <Link href="https://www.linkedin.com/in/abdullah-ibne-ali" target="_blank" className="hover:text-primary hover:scale-110 transition-all duration-300">
          <FaLinkedin className="w-5 h-5" />
        </Link>
      </div>
    </footer>
  );
}
