import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }

  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para continuar." },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const stripeCustomerId = user?.publicMetadata?.stripeCustomerId as
      | string
      | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No se encontró una suscripción activa." },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://tribai.co"}/planes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/portal] Error creando sesión del portal:", error);
    return NextResponse.json(
      { error: "Error al abrir el portal de facturación." },
      { status: 500 }
    );
  }
}
