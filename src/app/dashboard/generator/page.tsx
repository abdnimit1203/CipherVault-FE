"use client";

import { useState, useCallback, useEffect } from "react";
import { KeyRound, Copy, RefreshCw, Check, ShieldCheck, Plus, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GeneratorPage() {
  const [length, setLength] = useState(18);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      toast.error("Please select at least one character type.");
      return;
    }

    let pass = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      pass += chars[array[i] % chars.length];
    }

    setGeneratedPassword(pass);
    setIsCopied(false);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setIsCopied(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Password strength score
  const getStrength = () => {
    let score = 0;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (includeUpper) score += 1;
    if (includeNumbers) score += 1;
    if (includeSymbols) score += 1;
    return score;
  };

  const strength = getStrength();

  const getStrengthLabel = () => {
    if (strength <= 2) return { text: "Weak", color: "text-rose-400", bar: "bg-rose-500" };
    if (strength <= 3) return { text: "Medium", color: "text-amber-400", bar: "bg-amber-500" };
    if (strength <= 4) return { text: "Strong", color: "text-sky-400", bar: "bg-sky-400" };
    return { text: "Cryptographically Optimal", color: "text-emerald-400", bar: "bg-emerald-400" };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <section className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <KeyRound className="w-7 h-7 text-cyan-400" />
          <span>Password Generator</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Generate cryptographically random, uncrackable passwords in one tap.
        </p>
      </section>

      <Card className="glass-card border-cyan-500/30 bg-cyan-950/20 shadow-2xl rounded-3xl">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-base text-slate-300 font-semibold">
            Generated Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          
          {/* Display Output Box */}
          <div className="relative flex items-center justify-between bg-slate-950/80 border border-white/15 rounded-2xl p-4 shadow-inner gap-3">
            <span className="font-mono text-lg md:text-xl text-cyan-300 font-bold tracking-wider break-all select-all">
              {generatedPassword || "Select options below"}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={generatePassword}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleCopy}
                className="gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold px-4 rounded-xl shadow-lg shadow-cyan-500/20"
              >
                {isCopied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Security Rating</span>
              <span className={strengthInfo.color}>{strengthInfo.text}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    lvl <= strength ? strengthInfo.bar : "bg-slate-700/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controls: Length Slider */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold text-slate-200">Password Length</Label>
              <span className="font-mono font-bold text-cyan-300 text-base bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30">
                {length} chars
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Character Options Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-xs font-semibold text-slate-200">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-xs font-semibold text-slate-200">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-xs font-semibold text-slate-200">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-xs font-semibold text-slate-200">Symbols (!@#$)</span>
            </label>
          </div>

          {/* Save to Vault Action */}
          <div className="pt-4 border-t border-white/10">
            <Link
              href={`/dashboard/add?password=${encodeURIComponent(generatedPassword)}`}
              className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Save This Password to Vault
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
