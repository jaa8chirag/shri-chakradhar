"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "./brand-logo";
import { AnimatedCounter } from "./animated-counter";
import type { Brand } from "@/lib/types";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function LandingContent({
  brands,
  stats,
}: {
  brands: Brand[];
  stats: { label: string; value: number }[];
}) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shri Chakradhar Publication Pvt Ltd</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">One platform, five brands</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          All five storefronts below run on one unified catalog, one order system and one admin — instead of five separate WordPress
          sites with duplicated products and scattered orders.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Card className="p-4 text-center">
              <p className="font-heading text-2xl font-bold">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {brands.map((brand) => (
          <motion.div key={brand.id} variants={itemVariants}>
            <Link href={`/s/${brand.id}`} data-brand={brand.id} className="group block h-full">
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="h-full">
                <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lg">
                  <BrandLogo brand={brand} className="h-10 w-10" />
                  <h2 className="mt-4 font-heading font-semibold">{brand.name}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{brand.tagline}</p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-primary">
                    Visit storefront <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        <motion.div variants={itemVariants}>
          <Link href="/admin" className="group block h-full">
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="h-full">
              <Card className="flex h-full flex-col border-dashed bg-muted/30 p-5 transition-shadow hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-heading font-semibold">Unified Admin</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">One dashboard for all 5 brands — catalog, orders, customers and project jobs.</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground">
                  Open admin <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
