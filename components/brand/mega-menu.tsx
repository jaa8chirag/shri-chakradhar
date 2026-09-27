"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, GraduationCap } from "lucide-react";
import type { MenuLevel } from "@/lib/catalog-query";
import type { BrandId } from "@/lib/types";

export function MegaMenu({ brandId, menu }: { brandId: BrandId; menu: MenuLevel[] }) {
  const [open, setOpen] = useState(false);

  if (menu.length === 0) return null;

  return (
    <div className="relative hidden lg:block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Browse
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-40 mt-2 w-[min(90vw,720px)] rounded-2xl border bg-popover p-5 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {menu.map((section) => (
                <div key={section.level}>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {section.level}
                  </p>
                  <ul className="space-y-1">
                    {section.programmes.map((p) => (
                      <li key={p.name}>
                        <Link
                          href={`/s/${brandId}/browse?level=${section.level}&programme=${encodeURIComponent(p.name)}`}
                          className="flex items-center justify-between rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {p.name}
                          <span className="text-[10px] text-muted-foreground/70">{p.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-3 text-right">
              <Link href={`/s/${brandId}/browse`} className="text-sm font-medium text-brand-primary hover:underline">
                View full catalog →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
