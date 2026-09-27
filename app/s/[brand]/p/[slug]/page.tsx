import { redirect } from "next/navigation";

export default async function LegacyProductRedirect({ params }: { params: Promise<{ brand: string; slug: string }> }) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
