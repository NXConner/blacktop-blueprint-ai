export function getEnv(variableName: string, fallback: string = ""): string {
  // Prefer Vite's import.meta.env when available
  const viteEnv = (typeof import.meta !== "undefined" && (import.meta as any).env)
    ? (import.meta as any).env[variableName]
    : undefined;

  if (typeof viteEnv === "string" && viteEnv.length > 0) {
    return viteEnv;
  }

  // Fallback to Node's process.env for server-side or tooling contexts
  const nodeEnv = (typeof process !== "undefined" && (process as any).env)
    ? (process as any).env[variableName]
    : undefined;

  if (typeof nodeEnv === "string" && nodeEnv.length > 0) {
    return nodeEnv;
  }

  return fallback;
}