import type { ReactNode } from "react";

type BentoCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  gradient?: string;
};

export function BentoCard({ title, description, icon, className = "", gradient }: BentoCardProps) {
  return (
    <div
      className={`glow-card group rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-7 flex flex-col justify-between ${className}`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-[var(--color-border-default)] ${
          gradient || "bg-[var(--color-glow-purple)]"
        }`}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-purple)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
