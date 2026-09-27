import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getRedis } from "./kv";
import type { Order, ProjectJob } from "./types";

/**
 * Demo persistence: orders/project-jobs live in Upstash Redis when the deployment is
 * connected to one (see lib/kv.ts) — required on Vercel, whose serverless functions can't
 * write to the filesystem — and fall back to a local JSON file for zero-setup local dev.
 * Either way, every caller goes through these functions, never touches the store directly,
 * which is the seam that would become a real Postgres table later.
 */
const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const ORDERS_FILE = path.join(RUNTIME_DIR, "orders.json");
const PROJECT_JOBS_FILE = path.join(RUNTIME_DIR, "project-jobs.json");

const ORDERS_KEY = "orders";
const PROJECT_JOBS_KEY = "project-jobs";

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

/** Reads a collection from Redis, lazily seeding it from the local demo JSON the first time it's empty. */
async function readCollection<T>(key: string, seedFile: string): Promise<T[]> {
  const redis = getRedis();
  if (!redis) return readJsonFile<T[]>(seedFile, []);

  const existing = await redis.get<T[]>(key);
  if (existing !== null) return existing;

  const seed = await readJsonFile<T[]>(seedFile, []);
  await redis.set(key, seed);
  return seed;
}

async function writeCollection<T>(key: string, file: string, data: T[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, data);
    return;
  }
  await writeJsonFile(file, data);
}

export async function listOrders(): Promise<Order[]> {
  return readCollection<Order>(ORDERS_KEY, ORDERS_FILE);
}

export async function createOrder(order: Order): Promise<Order> {
  const orders = await listOrders();
  orders.unshift(order);
  await writeCollection(ORDERS_KEY, ORDERS_FILE, orders);
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const orders = await listOrders();
  const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
  await writeCollection(ORDERS_KEY, ORDERS_FILE, updated);
}

export async function listProjectJobs(): Promise<ProjectJob[]> {
  return readCollection<ProjectJob>(PROJECT_JOBS_KEY, PROJECT_JOBS_FILE);
}

export async function createProjectJob(job: ProjectJob): Promise<ProjectJob> {
  const jobs = await listProjectJobs();
  jobs.unshift(job);
  await writeCollection(PROJECT_JOBS_KEY, PROJECT_JOBS_FILE, jobs);
  return job;
}

export async function updateProjectJobStage(id: string, stage: ProjectJob["stage"]): Promise<void> {
  const jobs = await listProjectJobs();
  const updated = jobs.map((j) => (j.id === id ? { ...j, stage } : j));
  await writeCollection(PROJECT_JOBS_KEY, PROJECT_JOBS_FILE, updated);
}
