import { listProjectJobs } from "@/lib/orders-store";
import { ProjectKanban } from "@/components/admin/project-kanban";

export default async function AdminProjectsPage() {
  const jobs = await listProjectJobs();

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Project Jobs</h1>
      <p className="mt-1 text-sm text-muted-foreground">ignouproject.com&apos;s custom project pipeline. Drag cards between stages.</p>
      <div className="mt-6">
        <ProjectKanban jobs={jobs} />
      </div>
    </div>
  );
}
