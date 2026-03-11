"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function ConditionalClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      localization={{
        signIn: {
          start: {
            title: "Iniciar sesión",
            subtitle: "para continuar en tribai.co",
          },
        },
        signUp: {
          start: {
            title: "Crear cuenta",
            subtitle: "para continuar en tribai.co",
          },
        },
        userButton: {
          action__manageAccount: "Administrar cuenta",
          action__signOut: "Cerrar sesión",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
