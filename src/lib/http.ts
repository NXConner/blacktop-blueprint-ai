import { z, ZodTypeAny } from 'zod';

export interface HttpOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(input: RequestInfo | URL, options: HttpOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const resp = await fetch(input, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getJson<T = unknown>(input: RequestInfo | URL, options: HttpOptions = {}) {
  const response = await fetchWithTimeout(input, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await safeReadBody(response);
    throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` - ${body}` : ''}`);
  }

  return (await response.json()) as T;
}

async function safeReadBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export async function getValidatedJson<T>(
  input: RequestInfo | URL,
  schema: ZodTypeAny,
  options: HttpOptions = {}
): Promise<T> {
  const data = await getJson<unknown>(input, options);
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Response validation failed: ${result.error.message}`);
  }
  return result.data as T;
}