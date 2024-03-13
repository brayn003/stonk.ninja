import type { Metadata } from "next";
import { Suspense } from "react";

import ErrorAlert from "./_components/ErrorAlert";
import KiteLogin from "./_components/KiteLogin";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function PageLogin() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">stonk.ninja</div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;This is amazing!&rdquo;</p>
            <footer className="text-sm">@brayn003</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative h-full flex flex-col items-center justify-center lg:p-10">
        <div className="absolute top-8 left-0 right-0 lg:left-8 lg:right-8">
          <Suspense>
            <ErrorAlert />
          </Suspense>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <KiteLogin />
          {/* <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p> */}
        </div>
      </div>
    </div>
  );
}
