import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  id: string;
  index: string;
  title: string;
  tone?: "dark" | "light" | "muted";
};

const toneClasses = {
  dark: {
    section: "border-slate-950 bg-white",
    header: "border-slate-950 bg-slate-950 text-white",
    description: "text-slate-300",
    icon: "border-white/30 bg-white text-slate-950",
    index: "text-slate-400",
  },
  light: {
    section: "border-slate-300 bg-white",
    header: "border-slate-300 bg-white text-slate-950",
    description: "text-slate-600",
    icon: "border-slate-950 bg-slate-950 text-white",
    index: "text-slate-500",
  },
  muted: {
    section: "border-slate-400 bg-slate-100",
    header: "border-slate-400 bg-slate-200 text-slate-950",
    description: "text-slate-600",
    icon: "border-slate-950 bg-white text-slate-950",
    index: "text-slate-500",
  },
} as const;

export function DashboardSection({
  children,
  description,
  icon: Icon,
  id,
  index,
  title,
  tone = "light",
}: DashboardSectionProps) {
  const classes = toneClasses[tone];

  return (
    <section
      className={cn("min-w-0 scroll-mt-24 border", classes.section)}
      id={id}
    >
      <header
        className={cn(
          "flex flex-col gap-4 border-b-2 p-5 sm:flex-row sm:items-center",
          classes.header,
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center border",
            classes.icon,
          )}
        >
          <Icon size={21} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className={cn("text-xs font-bold uppercase", classes.index)}>
              {index}
            </span>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <p className={cn("mt-1 text-sm leading-6", classes.description)}>
            {description}
          </p>
        </div>
      </header>
      <div className="min-w-0 p-5 sm:p-6">{children}</div>
    </section>
  );
}
