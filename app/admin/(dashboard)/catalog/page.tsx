import Link from "next/link";
import { getBrands, getCatalog } from "@/lib/data";
import { paginate } from "@/lib/catalog-query";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { PriceEditor } from "@/components/admin/price-editor";

export default async function AdminCatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page } = await searchParams;
  const brands = await getBrands();
  const catalog = await getCatalog();

  const filtered = q
    ? catalog.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.courseCodes.some((c) => c.toLowerCase().includes(q.toLowerCase())))
    : catalog;

  const { items, totalPages, page: currentPage } = paginate(filtered, page ? Number(page) : 1, 50);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length.toLocaleString("en-IN")} products — one central catalog, per-brand visibility.</p>
        </div>
        <form className="w-full sm:w-72">
          <Input name="q" defaultValue={q} placeholder="Search title or course code…" />
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Course code</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Visible on</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.courseCodes[0] ?? "—"}</TableCell>
                <TableCell>
                  <PriceEditor productId={p.id} price={p.price} />
                </TableCell>
                <TableCell>
                  <VisibilityToggle productId={p.id} availableOn={p.availableOn} brands={brands} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {currentPage > 1 && (
            <Link href={`/admin/catalog?q=${q}&page=${currentPage - 1}`} className="text-muted-foreground hover:text-foreground">
              Previous
            </Link>
          )}
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/admin/catalog?q=${q}&page=${currentPage + 1}`} className="text-muted-foreground hover:text-foreground">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
