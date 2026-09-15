"use client";

import { useEffect } from "react";
import { sitePath } from "./site-path";

/** Preserve old URLs without requiring a server on GitHub Pages. */
export function StaticRedirect({ to }: { to: string }) {
  const destination = sitePath(`${to.replace(/\/$/, "")}/`);
  useEffect(() => { window.location.replace(destination); }, [destination]);
  return <meta httpEquiv="refresh" content={`0;url=${destination}`} />;
}
