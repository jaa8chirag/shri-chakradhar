"use client";

import { motion } from "framer-motion";
import { GlobalSearchBar } from "@/components/layout/global-search-bar";

export function HeroSection({ name, tagline }: { name: string; tagline: string }) {
  return (
    <section className="overflow-hidden border-b bg-gradient-to-b from-brand-primary/10 to-transparent px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-3xl font-bold tracking-tight sm:text-5xl"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-base text-muted-foreground sm:text-lg"
        >
          {tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-8 max-w-xl"
        >
          <GlobalSearchBar size="large" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-2 text-xs text-muted-foreground"
        >
          Try searching a course code like MMPC 001, BEGC 134 or BEVAE 181
        </motion.p>
      </motion.div>
    </section>
  );
}
