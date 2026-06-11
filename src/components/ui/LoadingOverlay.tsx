"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
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
  "Finalizing personalized briefings..."
];

export default function LoadingOverlay({ isVisible, title = "Analyzing Content..." }: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Hold at 95% until complete
        return prev + 1.5;
      });
    }, 200);

    // Status message cycling
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-2xl text-center flex flex-col items-center">
        {/* Animated brain/synapse icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-xl shadow-violet-900/30">
            <Activity className="h-8 w-8 animate-pulse text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 min-h-[40px] px-4 animate-fade-in">
          {statusMessages[messageIndex]}
        </p>

        {/* Kendo ProgressBar */}
        <div className="w-full mt-6 px-4">
          <ProgressBar
            value={progress}
            labelVisible={true}
            className="w-full h-2 rounded bg-zinc-800 border-none"
          />
          <div className="text-[10px] text-zinc-500 mt-2 text-right">
            Securing Neon Connection
          </div>
        </div>
      </div>
    </div>
  );
}
