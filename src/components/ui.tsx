import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

export function Button({
  variant = "primary",
  className,
  size = "md",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]";
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-900/30 hover:from-fuchsia-400 hover:to-violet-500",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    ghost: "text-slate-300 hover:bg-white/10 hover:text-white",
    danger: "bg-rose-600/80 text-white hover:bg-rose-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-500",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...rest} />;
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500",
        "focus:border-fuchsia-400/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white",
        "focus:border-fuchsia-400/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Card({ className, children, title, action }: { className?: string; children: ReactNode; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm sm:p-5", className)}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cn("mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400", className)}>{children}</label>;
}
