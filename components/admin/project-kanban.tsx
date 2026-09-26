"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectJob } from "@/lib/types";

const STAGES: ProjectJob["stage"][] = ["Topic", "Synopsis Draft", "Sent for Approval", "Revision", "Report Writing", "Delivered"];

export function ProjectKanban({ jobs: initialJobs }: { jobs: ProjectJob[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  async function moveJob(id: string, stage: ProjectJob["stage"]) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, stage } : j)));
    await fetch(`/api/project-jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageJobs = jobs.filter((j) => j.stage === stage);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => {
              if (dragId) moveJob(dragId, stage);
              setDragId(null);
              setDragOverStage(null);
            }}
            className={cn("w-64 shrink-0 rounded-xl border bg-muted/20 p-3 transition-colors", dragOverStage === stage && "border-brand-primary bg-brand-primary/5")}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-semibold">{stage}</p>
              <span className="text-xs text-muted-foreground">{stageJobs.length}</span>
            </div>
            <div className="space-y-2">
              {stageJobs.map((job) => {
                const overdue = new Date(job.dueDate) < new Date() && job.stage !== "Delivered";
                return (
                  <Card
                    key={job.id}
                    draggable
                    onDragStart={() => setDragId(job.id)}
                    className="cursor-grab space-y-1.5 p-3 active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium">{job.studentName}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{job.topic}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {job.programme}
                      </Badge>
                      {job.courseCode && (
                        <Badge variant="outline" className="text-[10px]">
                          {job.courseCode}
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-xs", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                      Due {new Date(job.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {overdue && " · overdue"}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
