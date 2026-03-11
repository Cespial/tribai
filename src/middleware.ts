import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HAS_CLERK = !!process.env.CLERK_SECRET_KEY;

export default async function middleware(req: NextRequest) {
  if (!HAS_CLERK) {
    return NextResponse.next();
  }

  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  return clerkMiddleware()(req, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
