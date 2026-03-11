import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para continuar." }, { status: 401 });
    }

    const { priceId } = (await req.json()) as { priceId: string };
    if (!priceId) {
      return NextResponse.json({ error: "Se requiere un priceId válido." }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://tribai.co";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/asistente?upgrade=success`,
      cancel_url: `${origin}/planes`,
      metadata: { userId },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    const msg = error instanceof Error ? error.message : "Error al crear la sesión de pago.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
