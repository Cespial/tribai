"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

/**
 * Chart color palette that adapts to light/dark mode.
 * 5 grayscale shades: darkest → lightest in light mode, lightest → darkest in dark mode.
 */
const LIGHT = ["#1f1d1a", "#706d66", "#b4b1aa", "#d8d6d1", "#0f0e0d"];
const DARK  = ["#E8E6E3", "#9CA3AF", "#6B7280", "#4B5563", "#F5F5F5"];

const subscribe = () => () => {};

export function useChartColors(): string[] {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) return LIGHT;
  return resolvedTheme === "dark" ? DARK : LIGHT;
}
