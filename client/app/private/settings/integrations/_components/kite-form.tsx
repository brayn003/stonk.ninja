"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const kiteFormSchema = z.object({
  api_key: z.string(),
  api_secret: z.string(),
});

export type KiteFormValues = z.infer<typeof kiteFormSchema>;

interface KiteFormProps {
  values?: KiteFormValues;
  onSubmit?: (values: KiteFormValues) => Promise<void>;
}

export function KiteForm({ values, onSubmit }: KiteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadonly, setIsReadonly] = useState(false);
  const form = useForm<KiteFormValues>({
    resolver: zodResolver(kiteFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    console.log("data - iii", values);
    if (values) {
      console.log("data.values", values);
      form.reset(values);
      setIsReadonly(true);
    } else {
      setIsReadonly(false);
    }
  }, [values]);

  async function onInternalSubmit(data: KiteFormValues) {
    if (typeof onSubmit !== "function") {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onInternalSubmit)} className="space-y-8">
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your API key here"
                      disabled={isReadonly || isSubmitting}
                      autoComplete="false"
                      {...field}
                    />
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
                    <Input
                      type="password"
                      placeholder="Your secret key here"
                      disabled={isReadonly || isSubmitting}
                      autoComplete="false"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end items-end">
            {isReadonly ? (
              <Button
                key="edit-configuration"
                variant="outline"
                type="button"
                onClick={() => {
                  setIsReadonly(false);
                }}
              >
                Edit configuration
              </Button>
            ) : (
              <Button key="save-configuration" disabled={isSubmitting} type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save configuration
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
