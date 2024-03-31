import { ENV_AUTH_TOKEN, ENV_SERVER_PRIVATE_URL } from "./env";

interface KiteSession {
  id: string;
  is_active: boolean;
  data: {
    api_key: string;
    access_token: string;
  };
}

interface IntegrationSessionResponse {
  integration_session: KiteSession;
}

export async function loadKiteSession() {
  const res = await fetch(`${ENV_SERVER_PRIVATE_URL}/api/integrations/kite/sessions/default`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${ENV_AUTH_TOKEN}`, "Content-Type": "application/json" },
  });
  return res.ok;
}

export async function getKiteSession() {
  const res = await fetch(`${ENV_SERVER_PRIVATE_URL}/api/integrations/kite/sessions/default`, {
    method: "GET",
    headers: { Authorization: `Bearer ${ENV_AUTH_TOKEN}`, "Content-Type": "application/json" },
  });
  let kiteSession = null;
  if (res.ok) {
    const data = (await res.json()) as IntegrationSessionResponse;
    kiteSession = data.integration_session;
  }
  return kiteSession;
}

export async function initialiseKiteSession(retries: number = 3, duration: number = 1000) {
  const delay = async (d: number) => await new Promise((resolve) => setTimeout(resolve, d));

  let kiteSession = await getKiteSession();
  if (!kiteSession || !kiteSession?.is_active) {
    let success = false;
    for (let i = 0; i < retries; i++) {
      success = await loadKiteSession();
      console.log(`[Connecting...] KITE ATTEMPT: ${i + 1} SUCCESS: ${success}`);
      if (!success) {
        await delay(duration);
      } else {
        break;
      }
    }

    if (success) {
      kiteSession = await getKiteSession();
    }
  }

  return kiteSession;
}
