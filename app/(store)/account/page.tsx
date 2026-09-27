import { User } from "lucide-react";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
      <User className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 font-heading text-xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign-in and order history are not part of this demo — the unified admin shows customer purchase history across all 5 brands instead.</p>
    </div>
  );
}
