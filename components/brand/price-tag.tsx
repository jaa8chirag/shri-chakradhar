import { cn } from "@/lib/utils";

export function PriceTag({ price, regularPrice, className }: { price: number; regularPrice: number; className?: string }) {
  const hasDiscount = regularPrice > price;
  const percentOff = hasDiscount ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-heading text-lg font-bold text-foreground">₹{price.toFixed(0)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">₹{regularPrice.toFixed(0)}</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{percentOff}% off</span>
        </>
      )}
    </div>
  );
}
