import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrand, getBrands, getProductBySlug, getProductsForBrand } from "@/lib/data";
import { ProductCover } from "@/components/brand/product-cover";
import { ProductCard } from "@/components/brand/product-card";
import { CourseCodeChip, TypeBadge, FormatBadge, LanguageBadge } from "@/components/brand/badges";
import { PriceTag } from "@/components/brand/price-tag";
import { AddToCartForm } from "@/components/brand/add-to-cart-form";
import { Badge } from "@/components/ui/badge";
import type { BrandId, Product } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ brand: string; slug: string }> }) {
  const { brand: brandId, slug } = await params;
  const product = await getProductBySlug(brandId as BrandId, slug);
  return { title: product?.title, description: product?.shortDescription };
}

export default async function ProductPage({ params }: { params: Promise<{ brand: string; slug: string }> }) {
  const { brand: brandId, slug } = await params;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const product = await getProductBySlug(brand.id, slug);
  if (!product) notFound();

  const allBrandProducts = await getProductsForBrand(brand.id);
  const siblings = findSiblings(product, allBrandProducts);
  const programmeMates = findProgrammeMates(product, allBrandProducts);
  const otherBrands = await otherBrandsSelling(product, brand.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href={`/s/${brand.id}`} className="hover:text-foreground">
          Home
        </Link>{" "}
        / <Link href={`/s/${brand.id}/browse`} className="hover:text-foreground">Browse</Link> / <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="mx-auto w-full max-w-sm">
          {product.images[0] ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <ProductCover product={product} brandLogo={brand.logo} className="aspect-[3/4]" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.courseCodes.map((code) => (
              <CourseCodeChip key={code} code={code} />
            ))}
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold leading-tight">{product.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <TypeBadge type={product.type} />
            <FormatBadge format={product.format} />
            <LanguageBadge language={product.language} />
            {product.session && <Badge variant="outline">Session {product.session}</Badge>}
          </div>

          <div className="mt-5">
            <PriceTag price={product.price} regularPrice={product.regularPrice} className="text-2xl" />
          </div>

          {siblings.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium">Also available as</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/s/${brand.id}/p/${s.slug}`}
                    className="rounded-full border px-3 py-1.5 text-sm hover:border-brand-primary hover:text-brand-primary"
                  >
                    {s.format === product.format ? s.language : s.format}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <AddToCartForm product={product} brandId={brand.id} />
          </div>

          {otherBrands.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Also available on: {otherBrands.map((b) => b.name).join(", ")} — same catalog, managed centrally.
            </p>
          )}

          {product.shortDescription && <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>}
        </div>
      </div>

      {product.description && (
        <div className="prose prose-sm mt-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: product.description }} />
      )}

      {programmeMates.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-lg font-semibold">Complete your programme</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {programmeMates.map((p) => (
              <ProductCard key={p.id} product={p} brandId={brand.id} brandLogo={brand.logo} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function findSiblings(product: Product, all: Product[]): Product[] {
  const shareCode = (p: Product) => p.courseCodes.some((c) => product.courseCodes.includes(c));
  return all.filter((p) => p.id !== product.id && p.type === product.type && shareCode(p) && (p.format !== product.format || p.language !== product.language)).slice(0, 4);
}

function findProgrammeMates(product: Product, all: Product[]): Product[] {
  if (!product.programme) return [];
  return all.filter((p) => p.id !== product.id && p.programme === product.programme && p.type === product.type).slice(0, 8);
}

async function otherBrandsSelling(product: Product, currentBrandId: BrandId) {
  const brands = await getBrands();
  return brands.filter((b) => product.availableOn.includes(b.id) && b.id !== currentBrandId);
}
