"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { UserAuthForm } from "./UserAuthForm";
import { UserAuthSuccess } from "./UserAuthSuccess";

export function UserAuthCard() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const requestToken = searchParams.get("request_token");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const loginCallback = async (requestToken: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login/callback`, {
        request_token: requestToken,
      });
      if (res.data.access_token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
    }
  };

  console.log({ type, status, requestToken, isLoading });

  useEffect(() => {
    setIsLoading(true);
    if (type === "login" && status === "success" && requestToken && !isLoading) {
      console.log("how many times");
      loginCallback(requestToken);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [type, status, requestToken, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (isAuthenticated) {
    return <UserAuthSuccess />;
  } else {
    return <UserAuthForm />;
  }
}
