# Design Tokens & Brand Guidelines

This document details the theme customization system used across the ReviewFlow SaaS platform workspace. All shared components imported from the central UI library (`@repo/ui`) read their visual properties from the central stylesheet.

---

## 1. Design System & CSS Variables

The styles and design tokens are defined in [styles.css](file:///c:/Users/nayan/Documents/GitHub/saas-platform/packages/ui/src/styles.css) inside `@repo/ui`. It uses **Tailwind CSS v4** with CSS-first configurations using `@theme` and inline CSS variables.

### The Cafe Amber Palette (Active Theme)
ReviewFlow default theme is custom-tailored to avoid generic blue/slate SaaS aesthetics. It uses a **warm, premium cafe-appropriate amber-tawny accent** with **stone-grey neutrals**.

Key variables (defined in HSL/OKLCH):
*   `--primary`: `oklch(0.52 0.14 52)` — Warm amber-tawny accent.
*   `--background`: `oklch(0.985 0.002 85)` — Soft white/stone-tinted background.
*   `--card`, `--popover`: White.
*   `--border`, `--input`: `oklch(0.91 0.005 75)` — Warm light borders.
*   `--ring`: Same as `--primary`.
*   `--radius`: `0.625rem` (10px rounded corners).

---

## 2. Using and Extending Components

All Shadcn UI primitives are located at `@repo/ui/components/ui/` (e.g., `@repo/ui/components/ui/button`).
When utilizing these components in any app, they automatically read CSS variables from the global stylesheet.

Example import inside an app page:
```tsx
import { Button } from "@repo/ui/components/ui/button";

export default function MyPage() {
  return (
    <Button variant="default">
      Click Me
    </Button>
  );
}
```

---

## 3. How to Customise / Change Theme

If you want to swap the custom theme or return to default Shadcn UI styling (e.g., standard Zinc, Slate, or Blue palettes):

### Option A: Adjust the Variables in `@repo/ui/src/styles.css`
Open [styles.css](file:///c:/Users/nayan/Documents/GitHub/saas-platform/packages/ui/src/styles.css) and edit the values under `:root` (Light mode) and `.dark` (Dark mode). You can use standard HSL or hex values.

For example, to swap to a **Sleek Slate/Indigo theme**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%; /* Indigo */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 56.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

### Option B: Local Overrides in Your App
If you only want to customize colors for a specific application without affecting other workspace projects:
1. Open the global CSS file of your app (e.g., `apps/reviewflow/app/globals.css`).
2. Add your custom styling variables directly inside `:root`:
   ```css
   :root {
     --primary: oklch(0.60 0.18 250); /* Overrides to a vivid blue */
   }
   ```
   Because CSS variables cascade, components rendered within that specific app will resolve to the overridden variables automatically.
