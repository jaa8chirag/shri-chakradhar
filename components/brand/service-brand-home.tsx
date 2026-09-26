import Link from "next/link";
import { PenLine, Send, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrustStrip } from "./trust-strip";
import type { Brand, BrandPages } from "@/lib/types";

const TIMELINE = [
  { icon: PenLine, label: "Synopsis", detail: "Delivered next day" },
  { icon: Send, label: "Guide approval", detail: "You share it with your guide" },
  { icon: FileText, label: "Report writing", detail: "Written in ~8 days" },
  { icon: CheckCircle2, label: "Delivery", detail: "Final report + softcopy" },
];

export function ServiceBrandHome({ brand, pages }: { brand: Brand; pages?: BrandPages }) {
  return (
    <div>
      <section className="border-b bg-gradient-to-b from-brand-primary/5 to-transparent px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">{brand.name}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{brand.tagline}</p>
          <Button size="lg" className="mt-8" nativeButton={false} render={<Link href={`/s/${brand.id}/order-project`}>Order your project now</Link>} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h2 className="text-center font-heading text-lg font-semibold">How it works</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TIMELINE.map(({ icon: Icon, label, detail }) => (
            <Card key={label} className="p-4 text-center">
              <Icon className="mx-auto h-6 w-6 text-brand-primary" />
              <p className="mt-2 text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <TrustStrip />

      {pages?.about && (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pages.about }} />
        </section>
      )}
    </div>
  );
}
