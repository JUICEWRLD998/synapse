"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@progress/kendo-react-progressbars";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
}

const statusMessages = [
  "Connecting to Neon PostgreSQL...",
  "Loading conference tracks and sessions...",
  "Running Gemini 2.5 Flash semantic analysis...",
  "Stitching topics and identifying synapses...",
  "Generating conference DNA profiles...",
  "Caching results to Neon databases...",
  "Optimizing knowledge graph topology...",
  "Finalizing personalized briefings...",
];

export default function LoadingOverlay({
  isVisible,
  title = "Analyzing Content...",
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 1.5;
      });
    }, 200);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-lg transition-opacity duration-300">
      <div className="w-full max-w-sm p-8 glass-card rounded-2xl text-center flex flex-col items-center">
        {/* Animated synapse icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl animate-glow-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-900/30">
            {/* Animated SVG synapse */}
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="6" cy="6" r="2" className="animate-pulse" />
              <circle cx="18" cy="6" r="2" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
              <circle cx="12" cy="18" r="2" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
              <line x1="7.5" y1="7.5" x2="16.5" y2="7.5" strokeDasharray="3 2" className="animate-pulse" />
              <line x1="7" y1="7.5" x2="11" y2="16.5" strokeDasharray="3 2" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
              <line x1="17" y1="7.5" x2="13" y2="16.5" strokeDasharray="3 2" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-zinc-400 min-h-[40px] px-2 transition-all duration-300">
          {statusMessages[messageIndex]}
        </p>

        {/* Kendo ProgressBar */}
        <div className="w-full mt-5">
          <ProgressBar
            value={progress}
            labelVisible={false}
            className="w-full h-1.5 rounded-full"
          />
          <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
