import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "slate"
  | "emerald"
  | "blue"
  | "amber"
  | "red"
  | "purple";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-slate-100 text-slate-700 ring-slate-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold uppercase ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
