"use client";

/**
 * Providers wrapper.
 * Kendo UI components work without a dedicated React context provider.
 * This file exists as the conventional extension point for future
 * QueryClient, ThemeProvider, or other global context wrappers.
 */

export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
