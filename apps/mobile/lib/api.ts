import { useAuth } from '@clerk/expo';
import { useCallback, useMemo, useRef } from 'react';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
};

export type ApiClient = {
  request: <T>(path: string, options?: RequestOptions) => Promise<T>;
};

// Clerk's useAuth() returns a new getToken reference on every render. Reading it
// through a ref keeps `request` stable and prevents render loops in consumers.
export function useApi(): ApiClient {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const request = useCallback(
    async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getTokenRef.current();
      const url = new URL(path, API_BASE_URL);
      if (options.searchParams) {
        for (const [key, value] of Object.entries(options.searchParams)) {
          if (value !== undefined) url.searchParams.set(key, value);
        }
      }

      const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new ApiError(response.status, text || response.statusText);
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    },
    [],
  );

  return useMemo(() => ({ request }), [request]);
}
