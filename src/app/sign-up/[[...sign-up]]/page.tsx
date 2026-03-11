"use client";

import { SignUp } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background px-4 py-12">
        <SignUp fallbackRedirectUrl="/asistente" />
      </main>
    </>
  );
}
