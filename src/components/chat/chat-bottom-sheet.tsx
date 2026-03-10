"use client";

import { ReactNode } from "react";

interface ChatBottomSheetProps {
  children: ReactNode;
}

export function ChatBottomSheet({ children }: ChatBottomSheetProps) {
  // On both mobile and desktop, render the chat directly.
  // The parent container handles full-height layout.
  return <div className="h-full">{children}</div>;
}
