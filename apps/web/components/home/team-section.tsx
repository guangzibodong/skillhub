import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function TeamSection({ locale }: Props) {
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      {/* Left: text (matches Morphic) */}
      <div>
        <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
          {locale === "zh" ? "团队协作" : "Built for teams"}
        </p>
        <h2 className="text-[40px] font-bold text-white tracking-[-0.04em] mb-5">
          {locale === "zh" ? "一起交付" : "Ship together"}
        </h2>
        <p className="text-[16px] text-[#999] leading-[1.6] mb-6">
          {locale === "zh"
            ? "邀请团队成员，共享项目，协作管理 API Key 和预算。基于角色的访问控制保护生产环境安全。"
            : "Invite your team, share projects, manage API keys and budgets collaboratively. Role-based access keeps production safe."}
        </p>

        {/* Avatar pills (like Morphic's Katie, Mike, James) */}
        <div className="flex items-center gap-3 mb-8">
          {["K", "M", "J"].map((letter, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-[#333] flex items-center justify-center">
                <span className="text-[10px] text-[#999]">{letter}</span>
              </div>
              <span className="text-[12px] text-[#999]">
                {["Katie", "Mike", "James"][i]}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a href={`/developer${langSuffix}`} className="btn-primary">
            {locale === "zh" ? "免费开始" : "Start for free"}
          </a>
          <a href={`/docs${langSuffix}`} className="btn-text">
            {locale === "zh" ? "查看定价" : "See pricing"}
          </a>
        </div>
      </div>

      {/* Right: dashboard mockup (visual weight) */}
      <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-5">
        {/* Project header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#7fee64] flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">Research Agent</p>
              <p className="text-[11px] text-[#666]">3 members · 5 skills</p>
            </div>
          </div>
          <span className="text-[11px] text-[#666] bg-[#292929] px-2.5 py-1 rounded-[6px]">Pro plan</span>
        </div>

        {/* Usage bars (visual element) */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-[#999]">API Calls</span>
              <span className="text-[11px] text-[#666]">12,482 / 50,000</span>
            </div>
            <div className="h-1.5 bg-[#292929] rounded-full overflow-hidden">
              <div className="h-full bg-[#7fee64] rounded-full" style={{ width: "25%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-[#999]">Budget</span>
              <span className="text-[11px] text-[#666]">$42.18 / $200.00</span>
            </div>
            <div className="h-1.5 bg-[#292929] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-verified)] rounded-full" style={{ width: "21%" }} />
            </div>
          </div>
        </div>

        {/* Recent activity rows */}
        <div className="space-y-0">
          {[
            { skill: "browser-research-pro", time: "2m ago", status: "success" },
            { skill: "crm-enrichment", time: "5m ago", status: "success" },
            { skill: "support-triage", time: "12m ago", status: "success" },
            { skill: "code-review-assistant", time: "18m ago", status: "error" },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${row.status === "success" ? "bg-[#10b981]" : "bg-[#ef4444]"}`} />
                <span className="text-[12px] text-white font-mono">{row.skill}</span>
              </div>
              <span className="text-[11px] text-[#525252]">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
