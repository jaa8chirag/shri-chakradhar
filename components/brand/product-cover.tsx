import { cn } from "@/lib/utils";
import type { Product, ProductType } from "@/lib/types";

const TYPE_LABEL: Record<ProductType, string> = {
  HelpBook: "Help Book",
  SolvedAssignment: "Solved Assignment",
  GuessPaper: "Guess Paper",
  QuestionPaper: "Question Paper",
  Project: "Project",
  Combo: "Combo",
  Other: "Study Material",
};

interface ProductCoverProps {
  product: Pick<Product, "courseCodes" | "programme" | "type" | "title">;
  brandLogo?: string;
  className?: string;
}

/**
 * Styled "book cover" shown whenever a product has no real product image:
 * brand gradient, course code in large type, programme, type badge, brand logo at the bottom.
 */
export function ProductCover({ product, brandLogo, className }: ProductCoverProps) {
  const code = product.courseCodes[0] ?? null;

  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-sm",
        className
      )}
      style={{
        background: "linear-gradient(155deg, var(--brand-primary) 0%, color-mix(in oklch, var(--brand-primary) 55%, black) 100%)",
      }}
    >
      <div className="inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
        {TYPE_LABEL[product.type]}
      </div>

      <div className="space-y-1.5">
        {code ? (
          <p className="font-heading text-3xl font-bold leading-none tracking-tight">{code}</p>
        ) : (
          <p className="font-heading text-lg font-semibold leading-tight line-clamp-3">{product.title}</p>
        )}
        {product.programme && <p className="text-sm font-medium text-white/80">{product.programme}</p>}
      </div>

      <div className="flex items-center justify-between">
        <p className="line-clamp-2 text-xs text-white/70">{product.title}</p>
        {brandLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brandLogo} alt="" className="h-6 w-auto shrink-0 opacity-90 grayscale invert" />
        )}
      </div>
    </div>
  );
}
