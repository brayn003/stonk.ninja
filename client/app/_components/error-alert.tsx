"use client";

import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorAlert() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>An error occured</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
