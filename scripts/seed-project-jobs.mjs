import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Fictional demo data for the CP-3 admin project kanban — clearly not real students.
// Valid `stage` values: Topic, Synopsis Draft, Sent for Approval, Revision, Report Writing, Delivered.
const jobs = [
  { studentName: "Ananya Verma (demo)", phone: "9800000001", programme: "MBA", courseCode: "MMPP-001", topic: "Impact of digital marketing on rural retail in Tier-2 India", stage: "Report Writing", dueOffsetDays: -2 },
  { studentName: "Rohit Sharma (demo)", phone: "9800000002", programme: "MCOM", courseCode: "MCOP-001", topic: "Working capital management in Indian FMCG companies", stage: "Sent for Approval", dueOffsetDays: 3 },
  { studentName: "Priya Nair (demo)", phone: "9800000003", programme: "BAG", courseCode: "BSOP-001", topic: "Help me choose a topic", stage: "Topic", dueOffsetDays: 8 },
  { studentName: "Aditya Kulkarni (demo)", phone: "9800000004", programme: "MSW", courseCode: "MSWP-001", topic: "Community-based rehabilitation for differently-abled adults", stage: "Synopsis Draft", dueOffsetDays: 1 },
  { studentName: "Sneha Reddy (demo)", phone: "9800000005", programme: "MCA", courseCode: "MCSP-232", topic: "Mobile app for tracking IGNOU assignment deadlines", stage: "Delivered", dueOffsetDays: -10 },
  { studentName: "Vikram Singh (demo)", phone: "9800000006", programme: "BCOM", courseCode: "BCOE-141", topic: "Consumer awareness of GST among small traders", stage: "Revision", dueOffsetDays: -1 },
  { studentName: "Meera Iyer (demo)", phone: "9800000007", programme: "MAPC", courseCode: "MPCE-032", topic: "Effect of social media use on adolescent anxiety levels", stage: "Report Writing", dueOffsetDays: 5 },
  { studentName: "Karan Malhotra (demo)", phone: "9800000008", programme: "MBA", courseCode: "MMPP-001", topic: "Employee retention strategies in Indian IT startups", stage: "Sent for Approval", dueOffsetDays: 2 },
  { studentName: "Fatima Sheikh (demo)", phone: "9800000009", programme: "BSW", courseCode: "BSWP-001", topic: "Help me choose a topic", stage: "Topic", dueOffsetDays: 9 },
];

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

const seeded = jobs.map((j, i) => ({
  id: `PRJ-SEED${String(i + 1).padStart(2, "0")}`,
  studentName: j.studentName,
  phone: j.phone,
  programme: j.programme,
  courseCode: j.courseCode,
  topic: j.topic,
  stage: j.stage,
  dueDate: new Date(now + j.dueOffsetDays * dayMs).toISOString(),
  createdAt: new Date(now - 10 * dayMs).toISOString(),
}));

const outDir = path.join(process.cwd(), "data", "runtime");
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "project-jobs.json"), JSON.stringify(seeded, null, 2));
console.log(`Seeded ${seeded.length} demo project jobs.`);
