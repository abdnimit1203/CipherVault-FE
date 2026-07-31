"use client";

import Image from "next/image";

interface CipherLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  text?: string;
}

export function CipherLoader({ size = "md", text = "Loading..." }: CipherLoaderProps) {
  if (size === "fullscreen") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0b1728] text-slate-100 relative overflow-hidden selection:bg-cyan-500/30">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="flex flex-col items-center gap-4 z-10">
          {/* Cyber Ring & Center Logo Loader */}
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Outer dashed spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-[spin_8s_linear_infinite]" />
            {/* Inner reverse spinning ring */}
            <div className="absolute inset-2 rounded-full border-2 border-indigo-400/40 animate-[spin_12s_linear_infinite_reverse]" />
            {/* Glowing background circle */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.4)] backdrop-blur-md animate-pulse">
              <Image
                src="/app-logo-icon.svg"
                alt="Cipher Loading"
                width={32}
                height={32}
                className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
                priority
              />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-semibold text-cyan-300/90 tracking-wide font-mono">
              {text}
            </h3>
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
