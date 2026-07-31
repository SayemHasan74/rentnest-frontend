import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-emerald-700",
  secondary:
    "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-900",
  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-500",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-slate-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  icon: "h-10 w-10",
};

export const buttonClasses = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}
