import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe/webhook] Error verificando firma:", err);
    return NextResponse.json({ error: "Firma del webhook inválida." }, { status: 400 });
  }

  const { clerkClient } = await import("@clerk/nextjs/server");
  const clerk = await clerkClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;

        if (userId) {
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: { plan: "pro", stripeCustomerId: customerId },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const users = await clerk.users.getUserList({ limit: 100 });
        const user = users.data.find(
          (u) => (u.publicMetadata as { stripeCustomerId?: string })?.stripeCustomerId === customerId
        );

        if (user) {
          await clerk.users.updateUserMetadata(user.id, {
            publicMetadata: { plan: "basic", stripeCustomerId: customerId },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("[stripe/webhook] Error procesando evento:", error);
    return NextResponse.json({ error: "Error procesando el evento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
