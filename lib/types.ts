export type BrandId =
  | "shrichakradhar"
  | "ignouproject"
  | "ignouquestionpaper"
  | "ignousolvedassignment"
  | "ignoustudymaterial";

export interface Brand {
  id: BrandId;
  domain: string;
  name: string;
  tagline: string;
  logo: string;
  favicon: string;
  colors: { primary: string; secondary: string };
  phones: string[];
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  social: Record<string, string>;
  productTypes: ProductType[];
  isServiceBrand?: boolean;
}

export type ProductType = "HelpBook" | "SolvedAssignment" | "GuessPaper" | "QuestionPaper" | "Project" | "Combo" | "Other";
export type ProductLevel = "Masters" | "Bachelors" | "Diploma" | "Certificate";
export type ProductFormat = "SoftCopy" | "HardCopy" | "Both";
export type ProductLanguage = "English" | "Hindi" | "Both";

export interface Product {
  id: string;
  slug: string;
  title: string;
  courseCodes: string[];
  programme: string | null;
  level: ProductLevel | null;
  type: ProductType;
  format: ProductFormat;
  language: ProductLanguage | null;
  session: string | null;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  currency: "INR";
  images: string[];
  shortDescription: string;
  description: string;
  categories: string[];
  tags: string[];
  availableOn: BrandId[];
  sourceUrls: Partial<Record<BrandId, string>>;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children: CategoryNode[];
}

export interface BrandPages {
  about: string | null;
  contact: string | null;
  faq: string | null;
  policies: { title: string; content: string }[];
  posts: { title: string; excerpt: string; date: string; slug: string }[];
}

export interface OrderItem {
  productId: string;
  title: string;
  courseCode: string | null;
  price: number;
  qty: number;
  format: string;
  language: string | null;
}

export interface Order {
  id: string;
  brandId: BrandId;
  items: OrderItem[];
  customer: { name: string; phone: string; email: string; address: string; city: string; pincode: string };
  deliveryOption: "digital" | "standard" | "express";
  total: number;
  status: "placed" | "processing" | "shipped" | "delivered";
  createdAt: string;
}

export interface ProjectJob {
  id: string;
  studentName: string;
  phone: string;
  programme: string;
  courseCode: string | null;
  topic: string;
  stage: "Topic" | "Synopsis Draft" | "Sent for Approval" | "Revision" | "Report Writing" | "Delivered";
  dueDate: string;
  createdAt: string;
}

export interface Stats {
  perBrand: Record<BrandId, { productCount: number; imageSuccessRate: number; parseFailures: number }>;
  totalUniqueProducts: number;
  sharedAcross2Plus: number;
  categoryCounts: Record<string, number>;
  blockedSites: string[];
  excludedHandwrittenAssignments: number;
  mergeLog: { keptId: string; mergedFrom: string[]; reason: string }[];
}
