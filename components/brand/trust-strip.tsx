import { ShieldCheck, Truck, Clock, MapPin } from "lucide-react";

const ITEMS = [
  { icon: Clock, label: "Since 2010" },
  { icon: MapPin, label: "Delhi-based" },
  { icon: Truck, label: "Fast delivery, PAN India" },
  { icon: ShieldCheck, label: "Trusted by IGNOU students" },
];

export function TrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 border-y bg-muted/40 px-4 py-4 sm:grid-cols-4 sm:gap-6 sm:px-6">
      {ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0 text-brand-primary" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
