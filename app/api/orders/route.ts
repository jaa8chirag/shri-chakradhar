import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/orders-store";
import type { Order } from "@/lib/types";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    brandId: body.brandId,
    items: body.items,
    customer: body.customer,
    deliveryOption: body.deliveryOption,
    total: body.total,
    status: "placed",
    createdAt: new Date().toISOString(),
  };

  await createOrder(order);
  return NextResponse.json({ order });
}
