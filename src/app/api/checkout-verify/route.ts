import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ verified: false, error: "Stripe не настроен" }, { status: 503 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ verified: false, error: "Нет session_id" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    if (!paid) {
      return NextResponse.json({ verified: false, error: "Оплата не подтверждена" }, { status: 402 });
    }
    return NextResponse.json({
      verified: true,
      email: session.customer_details?.email ?? "anonymous",
      sessionId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ verified: false, error: `Stripe error: ${message}` }, { status: 500 });
  }
}
