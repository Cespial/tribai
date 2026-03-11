export type UserPlan = "basic" | "pro";

const MODEL_MAP: Record<UserPlan, Record<"consulta" | "planificador", string>> =
  {
    basic: {
      consulta: "claude-haiku-4-5-20251001",
      planificador: "claude-sonnet-4-6",
    },
    pro: {
      consulta: "claude-sonnet-4-6",
      planificador: "claude-opus-4-6",
    },
  };

/**
 * Obtiene el plan del usuario desde los metadatos públicos de Clerk (server-side).
 * Retorna "basic" si no hay usuario autenticado o no tiene plan configurado.
 */
export async function getUserPlan(): Promise<UserPlan> {
  if (!isAuthEnabled()) return "basic";
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return "basic";

    const plan = user.publicMetadata?.plan as UserPlan | undefined;
    return plan === "pro" ? "pro" : "basic";
  } catch {
    return "basic";
  }
}

/**
 * Verifica si las variables de entorno de Clerk están configuradas.
 */
export function isAuthEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * Retorna el modelo de Claude correspondiente según el plan del usuario y el modo.
 */
export function getModelForPlan(
  plan: UserPlan,
  mode: "consulta" | "planificador"
): string {
  return MODEL_MAP[plan][mode];
}
