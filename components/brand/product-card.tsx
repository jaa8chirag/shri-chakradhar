"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProductCover } from "./product-cover";
import { CourseCodeChip } from "./badges";
import { PriceTag } from "./price-tag";
import type { Product } from "@/lib/types";

export function ProductCard({ product, brandLogo }: { product: Product; brandLogo?: string }) {
  const image = product.images[0];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="h-full"
    >
      <Link href={`/product/${product.slug}`} className="group block h-full">
        <Card className="gap-3 overflow-hidden p-3 transition-shadow hover:shadow-md">
          <div className="relative overflow-hidden rounded-xl">
            {image ? (
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                />
              </div>
            ) : (
              <ProductCover product={product} brandLogo={brandLogo} />
            )}
          </div>
          <div className="space-y-1.5 px-1 pb-1">
            {product.courseCodes[0] && <CourseCodeChip code={product.courseCodes[0]} />}
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{product.title}</h3>
            <PriceTag price={product.price} regularPrice={product.regularPrice} />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
