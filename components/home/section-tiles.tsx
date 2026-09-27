"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FileCheck, FileText, Lightbulb, GraduationCap } from "lucide-react";
import type { SectionMenuData } from "@/components/layout/section-mega-menu";

const ICONS = {
  "study-material": BookOpen,
  "solved-assignments": FileCheck,
  "question-papers": FileText,
  "guess-papers": Lightbulb,
  projects: GraduationCap,
} as const;

export function SectionTiles({ data }: { data: SectionMenuData[] }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-5 sm:px-6">
      {data.map(({ section, subBrand, startingPrice }, i) => {
        const Icon = ICONS[section.id];
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Link
              href={section.path}
              data-brand={section.subBrandId}
              style={{ "--brand-primary": subBrand.colors.primary } as React.CSSProperties}
              className="group flex h-full flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium leading-tight">{section.navLabel}</p>
              {startingPrice !== null && <p className="text-xs text-muted-foreground">from ₹{startingPrice}</p>}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
