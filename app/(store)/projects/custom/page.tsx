"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, PenLine, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const TIMELINE = [
  { icon: PenLine, label: "Synopsis", detail: "Delivered next day" },
  { icon: Send, label: "Guide approval", detail: "You share it with your guide" },
  { icon: FileText, label: "Report", detail: "Written in ~8 days" },
  { icon: CheckCircle2, label: "Delivery", detail: "Final report + softcopy" },
];

export default function OrderProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [topicMode, setTopicMode] = useState<"own" | "help">("own");
  const [form, setForm] = useState({ studentName: "", phone: "", programme: "", courseCode: "", topic: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/project-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic: topicMode === "help" ? "Help me choose a topic" : form.topic }),
      });
      const { job } = await res.json();
      router.push(`/projects/custom/confirmation?jobId=${job.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Order a custom IGNOU project</h1>
      <p className="mt-2 text-muted-foreground">Synopsis next day, full report in about 8 days.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TIMELINE.map(({ icon: Icon, label, detail }) => (
          <Card key={label} className="p-3 text-center">
            <Icon className="mx-auto h-5 w-5 text-brand-primary" />
            <p className="mt-2 text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Full name</Label>
            <Input required value={form.studentName} onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Phone / WhatsApp</Label>
            <Input required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Programme (e.g. MBA, BAG, MCOM)</Label>
            <Input required value={form.programme} onChange={(e) => setForm((f) => ({ ...f, programme: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Course code (if known)</Label>
            <Input value={form.courseCode} onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))} placeholder="e.g. MMPP-001" />
          </div>
        </div>

        <div>
          <Label className="mb-2 text-xs text-muted-foreground">Project topic</Label>
          <RadioGroup value={topicMode} onValueChange={(v) => setTopicMode(v as typeof topicMode)} className="mb-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="own" /> I have a topic
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="help" /> Help me choose
            </label>
          </RadioGroup>
          {topicMode === "own" && (
            <Textarea required value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="Describe your project topic" />
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Request project guidance
        </Button>
      </form>
    </div>
  );
}
