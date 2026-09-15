/** Next Link prefixes routes itself; raw public assets and redirects need this. */
export const basePath = "/arkhivum-site";

export function sitePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
