const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Resolve a `/public` path for subpath deployments (e.g. GitHub Pages). */
export function assetPath(path: string): string {
  if (!path.startsWith("/") || !BASE_PATH) return path;
  return `${BASE_PATH}${path}`;
}
