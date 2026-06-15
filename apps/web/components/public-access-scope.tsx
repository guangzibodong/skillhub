import { CheckCircle2, LockKeyhole } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type PublicAccessScopeProps = {
  locale: Locale;
};

const copy = {
  en: {
    publicTitle: "What works without login",
    publicItems: [
      "Search public skills.",
      "Inspect public manifests, schemas, permissions, runtime type, pricing intent, review state, and publisher profile.",
      "Copy public REST inspection commands.",
      "Compare verified and submitted skills before adopting them.",
    ],
    gatedTitle: "What requires login",
    gatedItems: [
      "Save or install a verified skill to a project.",
      "Create project runtime keys.",
      "Run login-gated runtime tests through project policy checks.",
      "Approve project policy, budget, subscription, billing, or ledger actions where the paid-preview role allows them.",
      "Submit feedback or trust reports.",
    ],
  },
  zh: {
    publicTitle: "\u65e0\u9700\u767b\u5f55\u5373\u53ef\u4f7f\u7528",
    publicItems: [
      "\u641c\u7d22\u516c\u5f00\u6280\u80fd\u3002",
      "\u67e5\u770b\u516c\u5f00 manifest\u3001schema\u3001\u6743\u9650\u3001\u8fd0\u884c\u65f6\u7c7b\u578b\u3001\u5b9a\u4ef7\u610f\u56fe\u3001\u5ba1\u6838\u72b6\u6001\u548c\u53d1\u5e03\u8005\u6863\u6848\u3002",
      "\u590d\u5236\u516c\u5f00 REST \u67e5\u770b\u547d\u4ee4\u3002",
      "\u5728\u91c7\u7528\u524d\u6bd4\u8f83\u5df2\u9a8c\u8bc1\u548c\u5df2\u63d0\u4ea4\u6280\u80fd\u3002",
    ],
    gatedTitle: "\u9700\u8981\u767b\u5f55\u540e\u4f7f\u7528",
    gatedItems: [
      "\u5c06\u5df2\u9a8c\u8bc1\u6280\u80fd\u4fdd\u5b58\u6216\u5b89\u88c5\u5230\u9879\u76ee\u3002",
      "\u521b\u5efa\u9879\u76ee\u8fd0\u884c Key\u3002",
      "\u901a\u8fc7\u9879\u76ee\u7b56\u7565\u68c0\u67e5\u540e\u53d1\u8d77\u767b\u5f55\u95e8\u63a7\u7684\u8fd0\u884c\u6d4b\u8bd5\u3002",
      "\u5728\u4ed8\u8d39\u9884\u89c8\u6743\u9650\u5141\u8bb8\u65f6\uff0c\u5ba1\u6279\u9879\u76ee\u7b56\u7565\u3001\u9884\u7b97\u3001\u8ba2\u9605\u3001\u8d26\u5355\u6216\u8d26\u672c\u52a8\u4f5c\u3002",
      "\u63d0\u4ea4\u53cd\u9988\u6216\u4fe1\u4efb\u4e3e\u62a5\u3002",
    ],
  },
} as const;

export function PublicAccessScope({ locale }: PublicAccessScopeProps) {
  const labels = copy[locale];

  return (
    <section className="public-access-scope" aria-labelledby="public-access-scope-heading">
      <article className="public-access-scope__panel">
        <div className="card-kicker">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span id="public-access-scope-heading">{labels.publicTitle}</span>
        </div>
        <ul>
          {labels.publicItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="public-access-scope__panel public-access-scope__panel--locked">
        <div className="card-kicker">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.gatedTitle}</span>
        </div>
        <ul>
          {labels.gatedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
