import { NextRequest, NextResponse } from "next/server";
import { createProjectJob, listProjectJobs } from "@/lib/orders-store";
import type { ProjectJob } from "@/lib/types";

export async function GET() {
  const jobs = await listProjectJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 8);

  const job: ProjectJob = {
    id: `PRJ-${Date.now().toString(36).toUpperCase()}`,
    studentName: body.studentName,
    phone: body.phone,
    programme: body.programme,
    courseCode: body.courseCode || null,
    topic: body.topic,
    stage: "Topic",
    dueDate: dueDate.toISOString(),
    createdAt: new Date().toISOString(),
  };

  await createProjectJob(job);
  return NextResponse.json({ job });
}
