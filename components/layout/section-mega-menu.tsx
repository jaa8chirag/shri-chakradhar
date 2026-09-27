"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import type { MenuLevel } from "@/lib/catalog-query";
import type { SectionConfig } from "@/lib/sections";
import type { Brand } from "@/lib/types";

export interface SectionMenuData {
  section: SectionConfig;
  subBrand: Brand;
  startingPrice: number | null;
  levels: MenuLevel[];
}

export function SectionMegaMenu({ data }: { data: SectionMenuData[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<Record<string, string>>({});
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function open(id: string) {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpenId(id), 150);
  }
  function scheduleClose() {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
  }
  function openNow(id: string) {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    setOpenId(id);
  }

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {data.map(({ section, subBrand, startingPrice, levels }) => {
        const isOpen = openId === section.id;
        const currentLevel = activeLevel[section.id] ?? levels[0]?.level;
        const levelData = levels.find((l) => l.level === currentLevel);

        return (
          <div
            key={section.id}
            className="relative"
            onMouseEnter={() => open(section.id)}
            onMouseLeave={scheduleClose}
            onFocus={() => openNow(section.id)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpenId(null);
                (e.currentTarget.querySelector("a") as HTMLAnchorElement | null)?.focus();
              }
            }}
          >
            <Link
              href={section.path}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {section.navLabel}
            </Link>

            <AnimatePresence>
              {isOpen && levels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-0 top-full z-40 mt-1 flex w-[720px] overflow-hidden rounded-2xl border bg-popover shadow-xl"
                >
                  <div className="w-36 shrink-0 border-r bg-muted/30 py-3">
                    {levels.map((l) => (
                      <button
                        key={l.level}
                        type="button"
                        onMouseEnter={() => setActiveLevel((prev) => ({ ...prev, [section.id]: l.level }))}
                        onFocus={() => setActiveLevel((prev) => ({ ...prev, [section.id]: l.level }))}
                        className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                          currentLevel === l.level ? "bg-background font-medium text-brand-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l.level}
                      </button>
                    ))}
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1 p-5">
                    {(levelData?.programmes ?? []).slice(0, 24).map((p) => (
                      <Link
                        key={p.name}
                        href={`${section.path}?level=${currentLevel}&programme=${encodeURIComponent(p.name)}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {p.name}
                        <span className="text-[10px] text-muted-foreground/70">{p.count}</span>
                      </Link>
                    ))}
                    <Link
                      href={section.path}
                      className="col-span-2 mt-2 border-t pt-2 text-sm font-medium text-brand-primary hover:underline"
                    >
                      View all programmes →
                    </Link>
                  </div>

                  <div className="w-56 shrink-0 border-l bg-brand-primary/5 p-5" data-brand={subBrand.id}>
                    <BrandLogo brand={subBrand} className="h-8 w-auto max-w-[120px]" />
                    <p className="mt-3 text-xs font-medium text-muted-foreground">{subBrand.tagline}</p>
                    {startingPrice !== null && (
                      <p className="mt-2 font-heading text-lg font-bold text-brand-primary">From ₹{startingPrice}</p>
                    )}
                    <ul className="mt-3 space-y-1">
                      {section.keyFacts.map((fact) => (
                        <li key={fact} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="mt-0.5 h-3 w-3 shrink-0 text-brand-primary" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={section.path}
                      className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Explore {section.navLabel}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <Link href="/combos" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">
        Combos
      </Link>
      <Link href="/offers" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">
        Offers
      </Link>
    </nav>
  );
}
