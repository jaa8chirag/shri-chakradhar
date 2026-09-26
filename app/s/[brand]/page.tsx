import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Search as SearchIcon, PackageCheck, Truck } from "lucide-react";
import { getBrand, getProductsForBrand, getPages } from "@/lib/data";
import { SearchBar } from "@/components/brand/search-bar";
import { ProductCard } from "@/components/brand/product-card";
import { TrustStrip } from "@/components/brand/trust-strip";
import { ServiceBrandHome } from "@/components/brand/service-brand-home";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BrandId, Product } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  return { title: brand?.name, description: brand?.tagline };
}

export default async function BrandHomePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const pages = await getPages();
  const brandPages = pages[brand.id];

  if (brand.isServiceBrand) {
    return <ServiceBrandHome brand={brand} pages={brandPages} />;
  }

  const products = await getProductsForBrand(brand.id);
  const featured = pickFeatured(products, 8);
  const programmes = topProgrammes(products, 8);

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-brand-primary/5 to-transparent px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">{brand.name}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{brand.tagline}</p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar brandId={brand.id} size="large" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Try searching a course code like MMPC 001, BEGC 134 or BEVAE 181</p>
        </div>
      </section>

      {programmes.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h2 className="font-heading text-lg font-semibold">Browse by programme</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {programmes.map((programme) => (
              <Link
                key={programme}
                href={`/s/${brand.id}/browse?programme=${encodeURIComponent(programme)}`}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                {programme}
              </Link>
            ))}
            <Link
              href={`/s/${brand.id}/browse`}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-brand-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Popular right now</h2>
            <Link href={`/s/${brand.id}/browse`} className="text-sm font-medium text-brand-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} brandId={brand.id} brandLogo={brand.logo} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="font-heading text-lg font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <HowItWorksCard icon={SearchIcon} step="1" title="Search your course code" body="Find your exact course by code — no need to hunt through categories." />
          <HowItWorksCard icon={PackageCheck} step="2" title="Choose your format" body="Pick soft copy (PDF) or hard copy, in English or Hindi, whichever suits you." />
          <HowItWorksCard icon={Truck} step="3" title="Get it fast" body="Instant download for soft copy, or quick delivery across India for hard copy." />
        </div>
      </section>

      <TrustStrip />

      {brandPages && brandPages.posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-heading text-lg font-semibold">From the blog</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {brandPages.posts.slice(0, 3).map((post) => (
              <Card key={post.slug} className="p-4">
                <p className="text-xs text-muted-foreground">{post.date ? new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>
                <h3 className="mt-1 line-clamp-2 font-medium">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <Card className="flex flex-col items-center gap-4 bg-brand-primary/5 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-heading text-xl font-bold">Can&apos;t find your course?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Message us on WhatsApp and we&apos;ll help you find the right material.</p>
          </div>
          <Button size="lg" nativeButton={false} render={<Link href={`/s/${brand.id}/contact`}>Contact us</Link>} />
        </Card>
      </section>
    </div>
  );
}

function HowItWorksCard({ icon: Icon, step, title, body }: { icon: React.ComponentType<{ className?: string }>; step: string; title: string; body: string }) {
  return (
    <Card className="p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">{step}</div>
      <Icon className="mt-3 h-5 w-5 text-brand-primary" />
      <h3 className="mt-2 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}

function pickFeatured(products: Product[], limit: number): Product[] {
  return [...products]
    .filter((p) => p.images.length > 0)
    .sort((a, b) => b.regularPrice - b.price - (a.regularPrice - a.price))
    .slice(0, limit);
}

function topProgrammes(products: Product[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.programme) counts.set(p.programme, (counts.get(p.programme) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([programme]) => programme);
}
