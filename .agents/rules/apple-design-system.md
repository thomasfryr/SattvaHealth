---
name: apple-design-system
description: Rules and guidelines for creating Apple-grade Human Interface Guidelines (HIG) UI/UX in SattvaHealth.
always_on: true
---

# Apple Design System & Health UI Guidelines

Every UI component, dashboard, and view built in SattvaHealth must look and feel like native Apple software (macOS / iOS / iPadOS) and Apple Health. 

## 1. Visual Hierarchy & Materials

### Foundations & Contrast
- **Backgrounds**:
  - Dark Mode (Preferred for Health apps): Pure Black (`#000000`) or Deepest Zinc (`#09090b`).
  - Light Mode: Off-white canvas (`#F5F5F7` or `#FBFBFD`).
- **Cards & Surfaces**:
  - Translucent surfaces with vibrancy: `bg-zinc-900/60 backdrop-blur-xl` (dark mode) or `bg-white/80 backdrop-blur-xl` (light mode).
  - Borders: Ultra-subtle hairline borders: `border border-white/[0.08]` (dark) or `border border-black/[0.05]` (light).
  - Never use heavy solid borders (e.g. `border-gray-400` or `border-gray-700`).
  - Radii hierarchy: Containers and parent cards must use `rounded-2xl` (16px) or `rounded-3xl` (24px). Internal elements (buttons, inner badges) use `rounded-xl` or `rounded-full`.

### Shadows & Depth
- Avoid muddy, dark drop shadows.
- Use soft, ambient illumination: `shadow-[0_8px_30px_rgb(0,0,0,0.12)]` or `shadow-sm`.
- Inner glows for active health widgets: subtle radial gradient highlights.

---

## 2. Color Palette: Apple Health Semantic Tokens

Never use generic bootstrap/tailwind primary blues (`#3b82f6`). Use Apple Health semantic accents:

| Health Domain | Color Token | Hex Code | Tailwind Representation |
| :--- | :--- | :--- | :--- |
| **Cardio / ECG / Holter** | Cardio Rose | `#FF2D55` | `text-rose-500`, `bg-rose-500/10` |
| **VFC (HRV) / Autonomic** | Vigor Orange | `#FF9500` | `text-amber-500`, `bg-amber-500/10` |
| **Sleep & Recovery** | Deep Lavender | `#AF52DE` | `text-purple-400`, `bg-purple-500/10` |
| **Activity / Caloric Burn** | Energetic Red | `#FF3B30` | `text-red-500`, `bg-red-500/10` |
| **Optimal Biomarkers (Lab)** | Apple Mint | `#34C759` | `text-emerald-400`, `bg-emerald-500/10` |
| **Trend Shift / Warning** | Warning Gold | `#FFCC00` | `text-yellow-400`, `bg-yellow-500/10` |
| **Clinical Diagnostic Docs** | Clinical Cyan | `#32ADE6` | `text-cyan-400`, `bg-cyan-500/10` |

---

## 3. Typography & Information Density

- **Font Family**: Inter, SF Pro, or Geist Sans.
- **Numbers & Metrics**:
  - Hero statistics must be prominent: `text-3xl font-semibold tracking-tight` or `text-4xl font-bold font-mono tracking-tighter`.
  - Units must be positioned alongside the number with reduced visual weight: e.g. `<span className="text-3xl font-semibold">68</span> <span className="text-sm font-medium text-zinc-400">lpm</span>`.
- **Labels & Subtitles**:
  - Small, uppercase or capitalized crisp labels: `text-xs font-medium text-zinc-400 uppercase tracking-wider`.
- **Personal Baseline Badges**:
  - Always show context relative to personal baseline: e.g., pill badge `+2.4% vs tu media (90d)` in subtle green or amber.

---

## 4. Micro-interactions & Tactile Feel

- **Tactile Click Feedback**:
  - Interactive cards and buttons MUST have scale compression on click: `active:scale-[0.98] transition-all duration-150 ease-out`.
  - Hover highlights: Subtle brightness increase or border illumination: `hover:border-white/20 hover:bg-zinc-900/80`.
- **Transitions**:
  - Use spring physics with `framer-motion`:
    ```tsx
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    ```

---

## 5. Health Data Visualizations (Charts & Sparklines)

- **Grid Lines**: Extremely faint or omitted: `stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3"`.
- **Area Charts**: Smooth curves (`type="monotone"`) with a vertical linear gradient transitioning from `opacity 0.4` at the top to `opacity 0` at the bottom.
- **Tooltips**: Custom floating glass card: `bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl`.
- **Zero Chart Noise**: No redundant legends if context is obvious from the card header. Clean X-axis dates.
