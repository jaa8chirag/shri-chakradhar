import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateProjectJobStage } from "@/lib/orders-store";
import type { ProjectJob } from "@/lib/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { stage } = (await request.json()) as { stage: ProjectJob["stage"] };
  await updateProjectJobStage(id, stage);
  revalidatePath("/admin/projects");
  return NextResponse.json({ ok: true });
}
