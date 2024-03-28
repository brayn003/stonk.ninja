"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const kiteFormSchema = z.object({
  api_key: z.string(),
  api_secret: z.string(),
});

type KiteFormValues = z.infer<typeof kiteFormSchema>;

export function KiteForm() {
  const form = useForm<KiteFormValues>({
    resolver: zodResolver(kiteFormSchema),
    defaultValues: {},
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: KiteFormValues) {
    setIsLoading(true);
    const res = await fetch("/api/integrations", {
      method: "POST",
      body: JSON.stringify({
        type: "kite",
        configuration: values,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setIsLoading(false);
    if (res.ok) {
      toast({
        description: "Your Kite configuration was saved successfully.",
      });
      console.log("Success");
    } else {
      toast({
        variant: "destructive",
        description: "Your Kite configuration was not saved.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="xxxxxxxx" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api_secret"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>API Secret</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="xxxxxxxx" disabled={isLoading} autoComplete="false" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end items-end">
          <Button disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
