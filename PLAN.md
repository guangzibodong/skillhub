# Homepage Redesign V2 — Premium AI Landing Page

## Design Philosophy

参考 Cursor.com、Linear.app、Vercel、xAI 的设计语言：
- **深色宇宙感**：纯黑底色 + 紫蓝色辐射渐变光晕
- **Glassmorphism**：毛玻璃卡片、半透明层级
- **Cinematic glow**：hero 区域的大面积柔光渐变背景
- **精致微动画**：粒子流、打字机效果、hover 光晕追踪、滚动触发
- **大气排版**：超大标题 + 细权重副标题 + monospace 标注

## Color Palette (V2)

| Token | Value | Notes |
|-------|-------|-------|
| bg-primary | `#000000` | 纯黑 (like Linear/Cursor) |
| bg-elevated | `#0a0a0f` | 微微偏紫的深黑 |
| bg-card | `rgba(255,255,255,0.03)` | 超透明白卡片 |
| accent-primary | `#8b5cf6` → `#6366f1` | 紫→靛蓝渐变 (hero glow) |
| accent-secondary | `#06b6d4` | 青色 (辅助高亮) |
| accent-green | `#10b981` | 验证/成功状态 |
| text-primary | `#f8fafc` | |
| text-secondary | `#94a3b8` | |
| text-muted | `#475569` | |
| border | `rgba(255,255,255,0.08)` | 超细微白边 |
| glow-purple | `rgba(139,92,246,0.15)` | 紫光晕 |
| glow-cyan | `rgba(6,182,212,0.1)` | 青光晕 |

## Sections & Layout

### 1. Hero Section (全屏高度)
- **背景**：纯黑 + 中心放射状紫蓝渐变光晕 (radial-gradient) + 微粒子网格动画
- **标题**：超大字号 (text-5xl → text-7xl)，渐变色文字 (紫→白 gradient text)
- **副标题**：轻权重灰色
- **CTA 按钮**：主按钮带发光边框 + 辉光效果；次按钮是 ghost style
- **Hero 展示**：一个发光边框的"浮动终端/产品界面"卡片，内含交互式代码演示
- **客户/数据条**：底部显示 "Trusted by X agents" 小统计

### 2. Logos/Trust Strip
- 已集成平台 logo 条（GitHub, Cursor, Claude, etc.）或统计数字
- 单行灰色 logo，hover 时变亮

### 3. Bento Grid Features (核心功能展示)
- 2×2 或不规则 bento grid 布局
- 每格是一个玻璃卡片：
  - 内部有一个产品截图或 SVG 动画示意
  - 标题 + 描述
  - 卡片 hover 时整体微微发光（边框渐变动画 rotating gradient border）
- 四个功能：Discovery, Schema, Runtime, Trust & Governance

### 4. Interactive Demo / Product Showcase
- 一个大的 "产品界面" 截图区域
- Tab 切换展示不同场景 (Browse / Invoke / Monitor)
- 带代码高亮的实时终端演示

### 5. How It Works (步骤时间线)
- 竖向时间线带发光连接线
- 每步有图标 + 编号 + 描述
- 连接线上有流动动画（CSS gradient animation）

### 6. Featured Skills (精选技能)
- 水平滚动或 grid，每卡带：
  - 发光边框
  - 能力标签
  - 实时数据 (调用次数, 延迟)
  - 评分星级

### 7. Testimonials / Social Proof
- 引言卡片 + 头像
- 或集成 Twitter/X 推文嵌入式

### 8. Final CTA
- 全宽深色区域 + 大渐变光晕背景
- 大标题 + 双按钮
- 底部装饰粒子

### 9. Footer
- 4列链接 + 社交图标
- 系统状态指示
- 语言切换

## New Components

| File | Description |
|------|-------------|
| `components/home/hero-glow.tsx` | 背景渐变光晕 + 粒子网格 (client) |
| `components/home/gradient-text.tsx` | 渐变色文字组件 |
| `components/home/glow-button.tsx` | 发光按钮 (主/次) |
| `components/home/bento-grid.tsx` | Bento 布局卡片 |
| `components/home/rotating-border.tsx` | 旋转渐变边框效果 |
| `components/home/product-showcase.tsx` | Tab 切换产品展示 |
| `components/home/timeline.tsx` | 流动时间线 |
| `components/home/marquee.tsx` | Logo/trust 滚动条 |
| `components/home/particle-field.tsx` | Canvas 粒子动画 |

## Updated Files

| File | Changes |
|------|---------|
| `app/tailwind.css` | 全新配色 + 更多动画 + glow utilities |
| `app/page.tsx` | 重写整体结构和文案 |
| `components/home/nav.tsx` | 更精致的 glass nav + 过渡动画 |
| `components/home/footer.tsx` | 加社交链接 + 更精致排版 |
| `components/home/skill-card.tsx` | 加旋转边框 + 更多数据展示 |
| `components/home/reveal.tsx` | 增加更多动画变体 |
| `components/home/code-animation.tsx` | 更丰富的语法高亮 + 打字效果 |

## Key Animations (CSS-only where possible)

1. **Rotating gradient border**: `@keyframes rotate-gradient` on pseudo-element
2. **Glow pulse**: radial-gradient opacity oscillation
3. **Particle grid**: Canvas 2D 粒子网络连线
4. **Typing cursor**: 闪烁光标 + 逐字打出
5. **Flow line**: 时间线上的光点沿路径移动 (gradient animation on border)
6. **Card tilt**: subtle perspective transform on hover (3D tilt)
7. **Marquee**: CSS infinite scroll for logos
8. **Stagger reveal**: IntersectionObserver + CSS transition-delay

## Tech Notes

- 无需新依赖，全部用 Tailwind v4 + 自定义 CSS
- Canvas 粒子用轻量原生实现 (~50 lines)
- 所有动画 respect `prefers-reduced-motion`
- 保持 Server Component for SEO, client 仅用于交互动画
- i18n 继续双语 (en/zh) 完整覆盖
