import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listProjectJobs } from "@/lib/orders-store";

export default async function ProjectConfirmationPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const { jobId } = await searchParams;
  const jobs = await listProjectJobs();
  const job = jobs.find((j) => j.id === jobId);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold">Request received!</h1>
      <p className="mt-1 text-muted-foreground">
        {job ? `Reference ${job.id} — our team will reach out on ${job.phone} shortly.` : "Your project guidance request has been recorded."}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">Expect your synopsis within 1 working day.</p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/">Back to home</Link>} />
    </div>
  );
}
