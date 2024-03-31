"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const kiteFormSchema = z.object({
  api_key: z.string(),
  api_secret: z.string(),
  is_autosession_enabled: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  totp_secret: z.string().optional(),
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
    defaultValues: {
      is_autosession_enabled: false,
    },
  });

  const isAutosessionEnabled = form.watch("is_autosession_enabled");

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onInternalSubmit)} className="space-y-4">
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
        <Card className="p-4 space-y-4">
          <div>
            <FormField
              control={form.control}
              name="is_autosession_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      disabled={isReadonly || isSubmitting}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-2 leading-none">
                    <FormLabel>Enable auto-session</FormLabel>
                    <FormDescription>Automatically refreshes the session when it expires</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          {isAutosessionEnabled && (
            <>
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Kite username here"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Your Kite password here"
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
              <div>
                <FormField
                  control={form.control}
                  name="totp_secret"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>TOTP secret</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your API key here"
                          disabled={isReadonly || isSubmitting}
                          autoComplete="false"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>You can find this by enabling external 2FA in your Kite account</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </Card>

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
  );
}
