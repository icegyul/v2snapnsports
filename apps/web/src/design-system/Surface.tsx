import type { PropsWithChildren } from "react";

export type SurfaceTone = "standard" | "elevated" | "floating";

export function Surface({ tone = "standard", children }: PropsWithChildren<{ tone?: SurfaceTone }>) {
  return <section className={`surface surface-${tone}`}>{children}</section>;
}
