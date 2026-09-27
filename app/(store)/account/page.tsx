import { User } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Card className="flex flex-col items-center p-8 text-center">
        <User className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign-in and order history are not part of this demo — the unified admin shows customer purchase history across all 5 brands instead.</p>
      </Card>
    </div>
  );
}
