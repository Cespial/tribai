import Stripe from "stripe";

function createStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export const stripe = createStripeClient();

export function getStripe(): Stripe {
  if (!stripe) throw new Error("Stripe no está configurado. Establece STRIPE_SECRET_KEY.");
  return stripe;
}
