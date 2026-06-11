import type { ReactNode } from "react";

type BentoCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
};

export function BentoCard({ title, description, icon, className = "" }: BentoCardProps) {
  return (
    <div
      className={`group glass-card glass-card-hover rounded-2xl p-7 transition-all duration-500 cursor-default ${className}`}
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(6,182,212,0.1)] border border-[rgba(255,255,255,0.08)] group-hover:border-[rgba(139,92,246,0.3)] transition-colors duration-500">
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2.5 group-hover:text-[#a78bfa] transition-colors duration-300">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
