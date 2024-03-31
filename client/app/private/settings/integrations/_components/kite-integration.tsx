"use client";

import { CheckIcon, Loader2, Loader2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

import type { KiteFormValues } from "./kite-form";
import { KiteForm } from "./kite-form";

interface APIIntegrationResponse {
  integration: {
    type: "kite";
    configuration: {
      integration_type: "kite";
      api_key: string;
      api_secret: string;
    };
  };
}

export function KiteIntegration() {
  const [isConfigFormOpen, setIsConfigFormOpen] = useState(false);
  const [isLoadSessionLoading, setIsLoadSessionLoading] = useState(false);

  const { isLoading, data, mutate } = useSWRImmutable("/api/integrations/kite", async (url) => {
    const res = await fetch(url);
    return (await res.json()) as APIIntegrationResponse;
  });

  const isConfigured = !!data?.integration?.configuration;

  async function loadSession() {
    setIsLoadSessionLoading(true);
    const res = await fetch("/api/integrations/kite/sessions/default", { method: "PUT" });
    setIsLoadSessionLoading(false);
    if (res.ok) {
      toast({ description: "Kite Connect session started" });
    } else {
      toast({ description: "Failed to start Kite Connect session", variant: "destructive" });
    }
  }

  async function onSubmit(values: KiteFormValues) {
    const res = await fetch("/api/integrations/kite", {
      method: "PATCH",
      body: JSON.stringify({
        type: "kite",
        configuration: {
          integration_type: "kite",
          ...values,
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      toast({ description: "Kite Connect configuration saved" });
      setIsConfigFormOpen(false);
      mutate();
    } else {
      toast({ description: "Failed to save Kite Connect configuration", variant: "destructive" });
    }
  }

  const statusIcon = useMemo(() => {
    if (isLoading) {
      return <Loader2Icon strokeWidth={4} className="text-muted-foreground animate-spin w-3.5 h-3.5" />;
    }
    if (isConfigured) {
      return <CheckIcon strokeWidth={4} className="text-muted-foreground w-3.5 h-3.5" />;
    }
    return null;
  }, [isLoading, data?.integration?.configuration]);

  return (
    <>
      <Card>
        <div className="flex flex-row p-6">
          <div className="flex-1 space-y-1.5">
            <div className="space-x-2 flex items-center flex-1">
              <CardTitle>Kite Connect APIs</CardTitle>
              {statusIcon}
            </div>
            <CardDescription>Connect your Kite trading account</CardDescription>
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => {
                setIsConfigFormOpen(true);
              }}
              variant={"secondary"}
            >
              Configure
            </Button>
            {isConfigured && (
              <Button disabled={isLoadSessionLoading} onClick={loadSession}>
                {isLoadSessionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Dialog
        open={isConfigFormOpen}
        onOpenChange={(o) => {
          setIsConfigFormOpen(o);
        }}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Kite</DialogTitle>
            <DialogDescription>Connect your Kite trading account</DialogDescription>
          </DialogHeader>
          <Separator />
          <KiteForm values={data?.integration?.configuration} onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}
