import { headers } from "next/headers";

function fallbackBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function getServerApiBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return fallbackBaseUrl();
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function fetchServerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = await getServerApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}