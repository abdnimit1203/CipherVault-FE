"use client";

import Image from "next/image";

interface CipherLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  text?: string;
}

export function CipherLoader({ size = "md", text = "Decrypting session..." }: CipherLoaderProps) {
  if (size === "fullscreen") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0b1728] text-slate-100 relative overflow-hidden selection:bg-cyan-500/30">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="flex flex-col items-center gap-6 z-10">
          {/* Cyber Ring & Center Logo Loader */}
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Outer dashed spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-[spin_8s_linear_infinite]" />
            {/* Inner reverse spinning ring */}
            <div className="absolute inset-2 rounded-full border-2 border-indigo-400/40 animate-[spin_12s_linear_infinite_reverse]" />
            {/* Glowing background circle */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.4)] backdrop-blur-md animate-pulse">
              <Image
                src="/app-logo-icon.svg"
                alt="ABD-CipherVault Symbol"
                width={36}
                height={36}
                className="w-9 h-9 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
                priority
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm md:text-base font-bold text-white tracking-wider uppercase font-mono bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent animate-pulse">
              {text}
            </h3>
            <p className="text-xs text-slate-400 font-medium">AES-256-GCM Zero-Knowledge Security</p>
          </div>
        </div>
      </div>
    );
  }

  // Small or Medium button/inline loader with logo
  const circleSize = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  const logoSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4 h-4";

  return (
    <div className="relative inline-flex items-center justify-center">
      <div className={`absolute inset-0 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin ${circleSize}`} />
      <div className={`flex items-center justify-center rounded-full bg-cyan-500/10 ${circleSize}`}>
        <Image
          src="/app-logo-icon.svg"
          alt="Cipher Loading"
          width={24}
          height={24}
          className={`${logoSize} animate-pulse filter drop-shadow-[0_0_6px_rgba(0,242,254,0.8)]`}
        />
      </div>
    </div>
  );
}
