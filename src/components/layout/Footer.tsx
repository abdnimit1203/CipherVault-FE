"use client";

import Link from "next/link";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { Bot, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#07111e]/90 backdrop-blur-md border-t border-white/10 py-6 px-4 text-slate-400 relative z-20 mt-auto  ">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span>Developed with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <Bot className="w-3.5 h-3.5 text-blue-500 animate-bounce fill-slate-200" />
          <span>by</span>
          <Link
            href="https://abdullah-portfolio-frontend.netlify.app/"
            target="_blank"
            className="font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            Abdullah Ibne Ali
          </Link>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>© {currentYear} <span className="font-bold text-slate-200">ABD-CipherVault</span>. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-5 text-slate-400">
          <Link href="https://www.facebook.com/abd.nimit" target="_blank" className="hover:text-cyan-400 hover:scale-110 transition-all duration-300">
            <FaFacebook className="w-4 h-4" />
          </Link>
          <Link href="https://www.instagram.com/abd_nimit" target="_blank" className="hover:text-cyan-400 hover:scale-110 transition-all duration-300">
            <FaInstagram className="w-4 h-4" />
          </Link>
          <Link href="https://github.com/abdnimit1203" target="_blank" className="hover:text-cyan-400 hover:scale-110 transition-all duration-300">
            <FaGithub className="w-4 h-4" />
          </Link>
          <Link href="https://www.linkedin.com/in/abdullah-ibne-ali" target="_blank" className="hover:text-cyan-400 hover:scale-110 transition-all duration-300">
            <FaLinkedin className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
