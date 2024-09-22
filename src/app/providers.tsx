"use client";

import { ThemeProvider } from "next-themes";
import React from "react";
import { DialogProvider } from "@/components/Dialog/DialogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
      <DialogProvider>{children}</DialogProvider>
    </ThemeProvider>
  );
}
