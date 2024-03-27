"use client";

import type { AxiosResponse } from "axios";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LoginResponse {
  login_url: string;
}
interface UserLoginProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function UserLogin({ className, ...props }: UserLoginProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onClick() {
    setIsLoading(true);
    const res: AxiosResponse<LoginResponse> = await axios.post("/api/auth/login");
    setIsLoading(false);
    window.open(res.data.login_url, "_self");
  }

  return (
    <div className="mb-8 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
          <p className="text-sm text-muted-foreground">Enter your email below to log into your account</p>
        </div>
      </div>
      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={() => {}}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                placeholder="password"
                type="password"
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect="off"
                disabled={isLoading}
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In with Email
            </Button>
          </div>
        </form>
        {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
        </div>
        <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitHubLogoIcon className="mr-2 h-4 w-4" />}{" "}
        GitHub
      </Button> */}
      </div>
      <p className="px-4 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
