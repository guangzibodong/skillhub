# Public Pages Redesign — Match Homepage Premium Style

## Assessment

After auditing all 12 public pages, they already use `AppShell`, the Tailwind design tokens, and the same component patterns (`.eyebrow`, `.heading-xl`, `.btn-primary`, `.card`). The structure is sound.

What's missing compared to the homepage's premium feel:
1. **No scroll animations** — homepage uses `<Reveal>` for staggered fade-in
2. **No section separators** — homepage uses `border-t border-[rgba(255,255,255,0.08)]`
3. **Flat heroes** — no gradient accent or visual depth
4. **No closing CTA** — most pages just end after content
5. **Inconsistent spacing** — some use `section` class, others use raw padding

## Plan: Polish Pass (12 pages)

For each page, apply these upgrades while keeping existing content/logic intact:

### Changes per page:
1. Wrap card grids and content blocks in `<Reveal>` with staggered delays
2. Add `border-t border-[rgba(255,255,255,0.08)]` between sections
3. Add a subtle hero gradient indicator (faint radial glow behind heading)
4. Add a closing CTA section before footer (link back to marketplace/docs)
5. Standardize section spacing to `py-[96px]` rhythm

### Pages:
| # | Page | Key additions |
|---|------|---------------|
| 1 | `marketplace` | Reveal on skill cards, section borders, closing CTA |
| 2 | `docs` | Reveal on API groups, section borders, closing CTA |
| 3 | `publish` | Reveal on journey steps, section borders |
| 4 | `security` | Reveal on cards, hero glow, closing CTA |
| 5 | `support` | Reveal on cards, hero glow, closing CTA |
| 6 | `terms` | Reveal on legal sections, section borders |
| 7 | `status` | Reveal on status cards, hero glow, live pulse dot |
| 8 | `registry` | Reveal on lifecycle/manifest, section borders, CTA |
| 9 | `agents` | Reveal on snippets, section borders |
| 10 | `publishers` | Reveal on publisher cards, stat-card upgrades |
| 11 | `publishers/[slug]` | Reveal on skill list, section borders |
| 12 | `skills/[slug]` | Reveal on detail sections, section borders |

### New CSS additions to `tailwind.css`:
- `.hero-glow` — faint radial gradient behind hero headings
- `.section-divider` — shorthand for the border-top separator

### Estimated scope:
- ~50-100 lines changed per small page (security, support, status)
- ~100-200 lines changed per medium page (agents, registry, publishers, terms, publish)
- ~200-300 lines changed per large page (marketplace, docs, skills/[slug])
- Total: ~1500-2000 lines of edits across 12 files + 1 CSS file
