"use client";

import { SignIn } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";

export default function SignInPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background px-4 py-12">
        <SignIn fallbackRedirectUrl="/asistente" />
      </main>
    </>
  );
}
