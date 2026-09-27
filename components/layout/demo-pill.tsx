"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, LayoutDashboard } from "lucide-react";
import { SECTIONS } from "@/lib/sections";

const DISMISS_KEY = "sc-demo-pill-dismissed";

export function DemoPill() {
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 w-56 rounded-2xl border bg-popover p-2 shadow-xl"
          >
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Jump to a section</p>
            {SECTIONS.map((s) => (
              <Link key={s.id} href={s.path} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                {s.navLabel}
              </Link>
            ))}
            <Link href="/admin" className="mt-1 flex items-center gap-1.5 rounded-lg border-t px-2 pt-2 text-sm font-medium text-brand-primary">
              <LayoutDashboard className="h-3.5 w-3.5" /> Open admin
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-1 rounded-full border bg-background/95 p-1 pl-3 text-xs font-medium shadow-lg backdrop-blur">
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 py-1">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" /> Demo
        </button>
        <button onClick={dismiss} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
