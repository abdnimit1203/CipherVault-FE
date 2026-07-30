"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Smooth spring physics for trailing outer cursor ring
  const ringX = useSpring(-100, { stiffness: 200, damping: 22 });
  const ringY = useSpring(-100, { stiffness: 200, damping: 22 });

  // Fast spring physics for center dot
  const dotX = useSpring(-100, { stiffness: 700, damping: 30 });
  const dotY = useSpring(-100, { stiffness: 700, damping: 30 });

  useEffect(() => {
    // Disable custom cursor on touch devices (phones/tablets)
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handlePointerOver);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handlePointerOver);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [ringX, ringY, dotX, dotY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Cyber Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          scale: isHovered ? 1.8 : 1,
          borderColor: isHovered ? "rgba(0, 242, 254, 0.9)" : "rgba(0, 242, 254, 0.4)",
          backgroundColor: isHovered ? "rgba(0, 242, 254, 0.1)" : "rgba(0, 242, 254, 0.02)",
        }}
        transition={{ duration: 0.2 }}
        className="fixed -top-4 -left-4 w-8 h-8 rounded-full border border-cyan-400/50 backdrop-blur-[1px] shadow-[0_0_15px_rgba(0,242,254,0.3)] pointer-events-none"
      />

      {/* Center Glowing Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
        }}
        animate={{
          scale: isHovered ? 0.6 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="fixed -top-1 -left-1 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.9)] pointer-events-none"
      />
    </div>
  );
}
