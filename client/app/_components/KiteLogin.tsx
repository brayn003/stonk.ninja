"use client";

import type { AxiosResponse } from "axios";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginResponse {
  login_url: string;
}
interface KiteLoginProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function KiteLogin({ className, ...props }: KiteLoginProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onClick() {
    setIsLoading(true);
    const res: AxiosResponse<LoginResponse> = await axios.post("/api/auth/login");
    setIsLoading(false);
    window.open(res.data.login_url, "_self");
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to stonk.ninja!</h1>
        <p className="text-sm text-muted-foreground">You&apos;ll need to authenticate with Kite to continue</p>
      </div>
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
        </div>
        <Button onClick={onClick} variant="outline" type="button" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Login with Kite
        </Button>
      </div>
    </>
  );
}
