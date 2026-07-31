"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Lock, UserCheck, KeyRound, Smartphone, Layers, Cpu, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User as FirebaseUser } from "firebase/auth";

const TOTAL_FRAMES = 180;

interface ScrollCanvasAnimationProps {
  user: FirebaseUser | null;
}

export function ScrollCanvasAnimation({ user }: ScrollCanvasAnimationProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const currentFrameIndexRef = useRef(0);

  // Track scroll progress across the ENTIRE homepage container
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  // Fast, responsive spring scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 24,
    restDelta: 0.0001,
  });

  // Transform scroll progress [0, 1] to frame index [0, 179]
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Update current frame ref continuously
  useEffect(() => {
    currentFrameIndexRef.current = currentFrameIndex;
  }, [currentFrameIndex]);

  // Progressive image preloader with background batching and instant nearest-frame fallback
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = loadedImages;
    let count = 0;

    const loadFrame = (index: number) => {
      if (index < 0 || index >= TOTAL_FRAMES || loadedImages[index]) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const img = new Image();
        const frameNum = String(index + 1).padStart(3, "0");
        img.src = `/BgScrollAnimation/ezgif-frame-${frameNum}.webp`;

        img.onload = img.onerror = () => {
          if (!isMounted) return resolve();
          loadedImages[index] = img;
          count++;
          setLoadedCount(count);
          if (count >= 3 && !isLoaded) {
            setIsLoaded(true);
          }
          // Redraw if this loaded image is the current target or closest fallback needed
          if (index === currentFrameIndexRef.current || count <= 15) {
            drawFrame(currentFrameIndexRef.current);
          }
          resolve();
        };
      });
    };

    const loadInitialFrames = async () => {
      // Get target frame based on current scroll position on mount
      const initialTarget = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameIndex.get() || 0)));

      // Load initial 15 critical frames PLUS current scroll target frame & neighbors
      const criticalIndices = new Set<number>();
      for (let i = 0; i < 15; i++) criticalIndices.add(i);
      for (let i = Math.max(0, initialTarget - 2); i <= Math.min(TOTAL_FRAMES - 1, initialTarget + 2); i++) {
        criticalIndices.add(i);
      }

      const initialPromises: Promise<void>[] = [];
      criticalIndices.forEach((idx) => {
        initialPromises.push(loadFrame(idx));
      });

      await Promise.all(initialPromises);
      if (!isMounted) return;
      drawFrame(currentFrameIndexRef.current);

      // Phase 2: Load remaining frames in background batches
      let nextIndex = 0;
      const loadNextBatch = () => {
        if (!isMounted || nextIndex >= TOTAL_FRAMES) return;
        const batchEnd = Math.min(TOTAL_FRAMES, nextIndex + 15);
        const batchPromises: Promise<void>[] = [];
        for (let i = nextIndex; i < batchEnd; i++) {
          if (!loadedImages[i]) {
            batchPromises.push(loadFrame(i));
          }
        }
        nextIndex = batchEnd;
        Promise.all(batchPromises).then(() => {
          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(loadNextBatch);
          } else {
            setTimeout(loadNextBatch, 40);
          }
        });
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(loadNextBatch);
      } else {
        setTimeout(loadNextBatch, 40);
      }
    };

    loadInitialFrames();

    return () => {
      isMounted = false;
    };
  }, []);

  // Draw frame zoomed & centered with nearest-frame fallback
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img = imagesRef.current[index];

    // Fallback: If exact frame isn't loaded yet, find nearest loaded frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let delta = 1; delta < TOTAL_FRAMES; delta++) {
        const prev = index - delta;
        const next = index + delta;
        if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]?.naturalWidth! > 0) {
          img = imagesRef.current[prev];
          break;
        }
        if (next < TOTAL_FRAMES && imagesRef.current[next]?.complete && imagesRef.current[next]?.naturalWidth! > 0) {
          img = imagesRef.current[next];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Cover ratio for bold zoomed rendering
    const hRatio = width / img.naturalWidth;
    const vRatio = height / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (width - img.naturalWidth * ratio) / 2;
    const centerShiftY = (height - img.naturalHeight * ratio) / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      centerShiftX,
      centerShiftY,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );
  };

  useEffect(() => {
    const unsubscribe = frameIndex.on("change", (latest) => {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(latest)));
      setCurrentFrameIndex(idx);
      drawFrame(idx);
    });

    drawFrame(currentFrameIndex);

    const handleResize = () => drawFrame(currentFrameIndex);
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [frameIndex, currentFrameIndex, isLoaded]);

  return (
    <div ref={pageRef} className="relative w-full bg-[#070f1e]">

      {/* 
        Fixed Canvas Background:
        - PC Version: Balanced width (md:max-w-7xl lg:max-w-[85vw]), rounded ONLY at top (rounded-t-[2.5rem] rounded-b-none)
        - Mobile Version: Full width (w-full h-screen px-0)
      */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full md:max-w-7xl lg:max-w-[80vw] h-screen md:h-screen md:px-4 overflow-hidden">

          <div className="relative w-full h-full rounded-none md:rounded-t-[2.5rem] md:rounded-b-none overflow-hidden border-0 md:border-t md:border-x md:border-b-0 md:border-cyan-500/25 shadow-none md:shadow-[0_-10px_60px_rgba(0,242,254,0.15)] bg-slate-950/40">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: loadedCount > 5 ? 1 : 0 }}
            />

            {/* Subtle Gradient Overlays for maximum text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070f1e]/90 via-[#070f1e]/30 to-[#070f1e]/85 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#070f1e]/40 to-[#070f1e]/90 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Floating Frame Counter Badge */}
      <div className="fixed bottom-5 right-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-cyan-500/30 text-cyan-400 text-xs font-mono backdrop-blur-md shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>FRAME: {String(currentFrameIndex + 1).padStart(3, "0")} / {TOTAL_FRAMES}</span>
      </div>

      {/* Homepage Sections floating on top across entire scroll path */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-28 md:space-y-36">

        {/* HERO SECTION WITH GAP FOR SUBJECT GRAPHIC */}
        <section className="min-h-[85vh] flex flex-col justify-between items-center text-center py-12">

          {/* Top Title Group */}
          <div className="space-y-4 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/35 shadow-lg backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              Next-Gen Zero-Knowledge Architecture
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Your digital secrets, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
                cryptographically secured.
              </span>
            </h1>
          </div>

          {/* VISUAL GAP: Keeps the 3D subject graphic in the middle frame image visible & focused */}
          <div className="w-full h-28 sm:h-36 md:h-48 my-4 pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-cyan-400/20 animate-ping opacity-30"></div>
          </div>

          {/* Bottom Subtitle & Action Group */}
          <div className="space-y-6 max-w-xl mx-auto w-full flex flex-col items-center">
            <p className="text-sm sm:text-base md:text-lg text-slate-100/95 leading-relaxed font-medium text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_8px_rgba(7,15,30,0.9)]">
              A premium password manager built with zero-knowledge architecture.
              Scroll down to unveil how your encrypted vault operates step-by-step.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full h-12 px-8 text-base font-bold shadow-xl shadow-cyan-500/30")}
              >
                {user ? "Open Your Vault" : "Create your Vault"}
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto rounded-full h-12 px-8 text-base font-bold border-white/20 bg-slate-950/80 backdrop-blur-xl hover:bg-white/10 text-white")}
              >
                {user ? "Go to Dashboard" : "Open Web Vault"}
              </Link>
            </div>
          </div>

        </section>

        {/* SECTION 1: Features */}
        <section id="features" className="scroll-mt-28">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2 block">01 / SECURITY FEATURES</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-snug drop-shadow-md">
              Key Features Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">Maximum Security</span>
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm font-medium">
              Everything you need to store, organize, and manage your credentials with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 md:p-7 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group backdrop-blur-xl bg-slate-950/80 shadow-2xl">
              <div className="w-11 h-11 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/35 mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Zero-Knowledge Architecture</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Client-side AES-256-GCM encryption means your master key never leaves your device.
              </p>
            </div>

            <div className="glass-card p-6 md:p-7 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group backdrop-blur-xl bg-slate-950/80 shadow-2xl">
              <div className="w-11 h-11 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/35 mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Owner Radio Selector</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Organize credentials with glass pill radio selectors: Personal, Family, Friend, or Other.
              </p>
            </div>

            <div className="glass-card p-6 md:p-7 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group backdrop-blur-xl bg-slate-950/80 shadow-2xl">
              <div className="w-11 h-11 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/35 mb-4 group-hover:scale-110 transition-transform">
                <KeyRound className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Instant Generator</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Generate cryptographically strong, complex passwords for every account in a single tap.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Cryptographic Engine */}
        <section id="security" className="scroll-mt-28">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2 block">02 / CRYPTOGRAPHIC ENGINE</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-snug drop-shadow-md">
              Zero-Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">Encryption Workflow</span>
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm font-medium">
              Your sensitive credentials remain encrypted even if servers are compromised.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Argon2id Key Derivation</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mt-0.5">
                    Master password processed via Argon2id KDF to generate 256-bit key inside your browser.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">AES-256-GCM Encryption</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mt-0.5">
                    Encrypted with unique IVs per record. Plaintext data never touches network sockets.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Volatile Memory Purge</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mt-0.5">
                    Decryption happens on-demand. Master keys stay in RAM and wipe cleanly on session lock.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-3xl border-cyan-500/35 bg-slate-950/90 backdrop-blur-2xl space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Cpu className="w-7 h-7 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Cryptographic Specs</h4>
              </div>
              <div className="font-mono text-xs text-cyan-300/90 space-y-2 bg-black/80 p-4 rounded-2xl border border-cyan-500/30">
                <p className="flex justify-between"><span className="text-slate-400">Cipher:</span> <span>AES-256-GCM</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Key Length:</span> <span>256 Bits</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Memory Cost:</span> <span>64 MB</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Iterations:</span> <span>3 Passes</span></p>
                <p className="flex justify-between"><span className="text-slate-400">SubtleCrypto:</span> <span>Native Web Crypto</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PWA & Mobile Native Experience */}
        <section id="pwa" className="scroll-mt-28">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2 block">03 / MOBILE & PWA NATIVE</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-snug drop-shadow-md">
              Progressive Web App <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">(PWA) Ready</span>
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm font-medium">
              Install ABD-CipherVault to your home screen for a fast native app experience on all devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-card p-6 md:p-8 rounded-3xl border-white/15 backdrop-blur-xl bg-slate-950/80 space-y-2 text-center shadow-xl">
              <Smartphone className="w-9 h-9 text-cyan-400 mx-auto" />
              <h4 className="text-base font-bold text-white">1-Tap Installation</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Add to Home Screen from Chrome or Safari for full-screen, native application response.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-3xl border-white/15 backdrop-blur-xl bg-slate-950/80 space-y-2 text-center shadow-xl">
              <Layers className="w-9 h-9 text-cyan-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Thumb-Friendly UI</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Tailored for one-handed mobile usage with comfortable touch targets and floating nav bars.
              </p>
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="glass-card p-8 md:p-10 rounded-3xl border-cyan-400/40 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-indigo-950/80 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="text-left space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Ready to secure your credentials?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">Start protecting your digital life with zero-knowledge AES-256 encryption today.</p>
            </div>
            <Link
              href={user ? "/dashboard" : "/signup"}
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 font-bold shadow-xl shadow-cyan-500/30 shrink-0")}
            >
              {user ? "Enter Vault Dashboard" : "Create Free Account"}
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
