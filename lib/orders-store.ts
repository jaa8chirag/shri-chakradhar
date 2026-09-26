import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Order, ProjectJob } from "./types";

/**
 * Demo persistence: orders/project-jobs live in a local JSON file instead of a real database.
 * This is the seam that would become a Postgres table behind an API in production — every
 * caller goes through these functions, never touches the file directly.
 */
const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const ORDERS_FILE = path.join(RUNTIME_DIR, "orders.json");
const PROJECT_JOBS_FILE = path.join(RUNTIME_DIR, "project-jobs.json");

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(file: string, data: unknown): Promise<void> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
}

export async function listOrders(): Promise<Order[]> {
  return readJsonFile<Order[]>(ORDERS_FILE, []);
}

export async function createOrder(order: Order): Promise<Order> {
  const orders = await listOrders();
  orders.unshift(order);
  await writeJsonFile(ORDERS_FILE, orders);
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const orders = await listOrders();
  const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
  await writeJsonFile(ORDERS_FILE, updated);
}

export async function listProjectJobs(): Promise<ProjectJob[]> {
  return readJsonFile<ProjectJob[]>(PROJECT_JOBS_FILE, []);
}

export async function createProjectJob(job: ProjectJob): Promise<ProjectJob> {
  const jobs = await listProjectJobs();
  jobs.unshift(job);
  await writeJsonFile(PROJECT_JOBS_FILE, jobs);
  return job;
}

export async function updateProjectJobStage(id: string, stage: ProjectJob["stage"]): Promise<void> {
  const jobs = await listProjectJobs();
  const updated = jobs.map((j) => (j.id === id ? { ...j, stage } : j));
  await writeJsonFile(PROJECT_JOBS_FILE, updated);
}
