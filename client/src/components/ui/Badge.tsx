import { ReactNode } from "react";
import clsx from "clsx";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className || "border-border bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}
