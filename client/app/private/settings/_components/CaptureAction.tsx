"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function CaptureAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!loading && error) {
      toast({
        variant: "destructive",
        description: error,
      });
    }
  }, [error, loading]);

  const handleClick = async () => {
    if (!loading) {
      setLoading(true);
      setError(null);

      try {
        await axios.post("/api/ticks/capture/start");
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || "Unknown error occurred";
        setError(errorMsg as string);
      }

      setLoading(false);
    }
  };

  return <Button onClick={handleClick}>Start capturing</Button>;
}
