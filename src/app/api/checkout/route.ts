import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Stripe не настроен — нет STRIPE_SECRET_KEY или STRIPE_PRO_PRICE_ID" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secretKey);
  const origin = req.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pro-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pro=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: `Stripe error: ${message}` }, { status: 500 });
  }
}
