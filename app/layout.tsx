import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const devanagariFont = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Shri Chakradhar Publication — IGNOU Study Store",
    template: "%s | Shri Chakradhar Publication",
  },
  description: "IGNOU help books, solved assignments, guess papers, question papers and project guidance — five brands, one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${devanagariFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
