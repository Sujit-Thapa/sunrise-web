# Sunrise Multiple Businesses & Housing Pvt. Ltd.
## Web Design System — Next.js + Tailwind CSS

---

## Table of Contents

1. [Colour Tokens](#1-colour-tokens)
2. [Typography](#2-typography)
3. [Spacing Scale](#3-spacing-scale)
4. [Layout & Grid](#4-layout--grid)
5. [Border Radius & Shadows](#5-border-radius--shadows)
6. [Component Tokens](#6-component-tokens)
7. [Section Backgrounds](#7-section-backgrounds)
8. [Motion & Transitions](#8-motion--transitions)
9. [Project Structure](#9-project-structure)
10. [File Structure](#10-file-structure)
11. [Tailwind Config](#11-tailwind-config)
12. [Naming Conventions](#12-naming-conventions)
13. [Component Architecture](#13-component-architecture)
14. [Page Structure Pattern](#14-page-structure-pattern)
15. [Environment & Config Files](#15-environment--config-files)
16. [Git & Branch Strategy](#16-git--branch-strategy)

---

## 1. Colour Tokens

Defined in `tailwind.config.ts` and usable as `bg-gold-primary`, `text-midnight`, etc.

| Token Name       | HEX       | Usage |
|---|---|---|
| `gold-primary`   | `#D4920A` | Primary CTAs, active links, key accents |
| `gold-highlight` | `#F5B931` | Hover states, badges, highlights |
| `gold-deep`      | `#A8720A` | Pressed/active CTA, gold borders |
| `midnight`       | `#0D1B2A` | Dark section backgrounds, navbar |
| `ink`            | `#1A1A1A` | Body text, headings on light backgrounds |
| `stone`          | `#777777` | Captions, placeholders, secondary text |
| `blush`          | `#FDF3DC` | Page background, card backgrounds, light sections |

---

## 2. Typography

### Typeface — Radikal
The only permitted typeface. Load via `@font-face` in `globals.css`.

```css
/* app/globals.css */
@font-face {
  font-family: 'Radikal';
  src: url('/fonts/Radikal-Light.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}
@font-face {
  font-family: 'Radikal';
  src: url('/fonts/Radikal-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Radikal';
  src: url('/fonts/Radikal-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

Font files go in `/public/fonts/`.

### Type Scale (Tailwind)

| Class | Size | Usage |
|---|---|---|
| `text-xs`   | 12px | Fine print, labels |
| `text-sm`   | 14px | Captions, metadata |
| `text-base` | 16px | Body copy |
| `text-lg`   | 18px | Lead paragraph |
| `text-xl`   | 20px | Card titles |
| `text-2xl`  | 24px | Section subheadings |
| `text-3xl`  | 30px | Section headings |
| `text-4xl`  | 36px | Page headings |
| `text-5xl`  | 48px | Hero headings |

### Rules
- Body copy → `font-light` (300) or `font-normal` (400) only
- Headings → `font-bold` (700) only
- **Never** use `font-bold` in paragraphs or long-form text
- **Never** add a second font family

---

## 3. Spacing Scale

Tailwind's default spacing scale (base-4 = 1rem) is used as-is. Key references:

| Tailwind Class | Value | Usage |
|---|---|---|
| `p-1` / `m-1`   | 4px   | Tight internal padding |
| `p-2` / `m-2`   | 8px   | Icon padding, tight gaps |
| `p-3` / `m-3`   | 12px  | Small component padding |
| `p-4` / `m-4`   | 16px  | Default component padding |
| `p-6` / `m-6`   | 24px  | Card padding, gaps |
| `p-8` / `m-8`   | 32px  | Section inner padding |
| `p-12` / `m-12` | 48px  | Section vertical spacing |
| `p-16` / `m-16` | 64px  | Large section gaps |
| `p-24` / `m-24` | 96px  | Hero / section spacing |

---

## 4. Layout & Grid

### Container

```tsx
// Use this wrapper for all page sections
<div className="mx-auto max-w-container px-4 md:px-8">
  {children}
</div>
```

Create a reusable component at `components/layout/Container.tsx`.

### Grid

```tsx
// 12-column grid
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">...</div>
</div>
```

### Breakpoints (Tailwind defaults)

| Prefix | Width  |
|---|---|
| `sm:`  | 640px  |
| `md:`  | 768px  |
| `lg:`  | 1024px |
| `xl:`  | 1280px |

---

## 5. Border Radius & Shadows

Defined as custom values in `tailwind.config.ts`.

| Token | Value | Usage |
|---|---|---|
| `rounded-brand-sm` | 4px | Buttons, tags |
| `rounded-brand-md` | 8px | Cards, inputs |
| `rounded-brand-lg` | 16px | Feature cards, modals |
| `shadow-brand-sm`  | `0 1px 3px rgba(13,27,42,0.12)` | Default card |
| `shadow-brand-md`  | `0 4px 16px rgba(13,27,42,0.16)` | Hover card |
| `shadow-brand-lg`  | `0 8px 32px rgba(13,27,42,0.20)` | Modal, drawer |
| `shadow-gold`      | `0 4px 20px rgba(212,146,10,0.25)` | Gold CTA hover |

---

## 6. Component Tokens

### Buttons

```tsx
// Primary
<button className="bg-gold-primary hover:bg-gold-deep hover:shadow-gold text-blush text-sm font-normal uppercase tracking-widest px-8 py-3 rounded-brand-sm transition-all duration-250">
  Get Started
</button>

// Secondary (outline)
<button className="border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-blush text-sm font-normal uppercase tracking-widest px-8 py-3 rounded-brand-sm transition-all duration-250">
  Learn More
</button>
```

### Cards

```tsx
// Light card
<div className="bg-blush rounded-brand-md shadow-brand-sm hover:shadow-brand-md p-8 transition-all duration-250">
  {children}
</div>

// Dark card
<div className="bg-midnight text-blush rounded-brand-md shadow-brand-sm hover:shadow-brand-md p-8 transition-all duration-250">
  {children}
</div>
```

### Navbar

```tsx
<nav className="bg-midnight px-8 py-4">
  <a className="text-stone hover:text-gold-primary text-sm uppercase tracking-wide transition-colors duration-150">
    Link
  </a>
</nav>
```

---

## 7. Section Backgrounds

Alternate light and dark sections for visual rhythm:

| Section | Tailwind Classes | Text Color |
|---|---|---|
| Light | `bg-blush` | `text-ink` |
| Dark  | `bg-midnight` | `text-blush` |

Gold accents work on both. Use `text-gold-primary` or `border-gold-primary` freely on either.

---

## 8. Motion & Transitions

```tsx
// Fast — hover feedback
className="transition-colors duration-150"

// Base — button, card, link interactions
className="transition-all duration-250"

// Slow — page elements, reveal animations
className="transition-all duration-400"
```

For scroll reveal / entrance animations, use `framer-motion`:

```bash
npm install framer-motion
```

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
  viewport={{ once: true }}
>
  {children}
</motion.div>
```

---

## 9. Project Structure

```
sunrise-web/
├── app/                        # Next.js App Router
│   ├── (marketing)/            # Route group — public pages
│   │   ├── page.tsx            # Homepage /
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx        # Projects listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual project
│   │   ├── services/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── layout.tsx              # Root layout (font, metadata, navbar, footer)
│   ├── globals.css             # Font face declarations, base styles
│   └── not-found.tsx
│
├── components/
│   ├── layout/                 # Structural components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx       # Max-width wrapper
│   │   └── Section.tsx         # Section wrapper with bg variants
│   │
│   ├── ui/                     # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Divider.tsx
│   │   └── SectionHeading.tsx
│   │
│   ├── sections/               # Page-level sections (used in pages)
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ProjectsGrid.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── ContactSection.tsx
│   │
│   └── forms/                  # Form components
│       ├── ContactForm.tsx
│       └── EnquiryForm.tsx
│
├── lib/                        # Utilities and helpers
│   ├── utils.ts                # cn() helper, formatters
│   ├── constants.ts            # Site-wide constants (nav links, contact info)
│   └── metadata.ts             # Shared SEO metadata helpers
│
├── hooks/                      # Custom React hooks
│   ├── useScrollPosition.ts
│   └── useMediaQuery.ts
│
├── types/                      # TypeScript types
│   ├── index.ts
│   └── project.ts
│
├── public/
│   ├── fonts/                  # Radikal font files (.woff2)
│   │   ├── Radikal-Light.woff2
│   │   ├── Radikal-Regular.woff2
│   │   └── Radikal-Bold.woff2
│   ├── images/
│   │   ├── logo/               # Logo variants (svg, png)
│   │   ├── projects/           # Project photos
│   │   └── og/                 # Open Graph images
│   └── favicon.ico
│
├── styles/                     # Additional global styles if needed
│   └── animations.css
│
├── .env.local                  # Local environment variables (never commit)
├── .env.example                # Committed env template
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## 10. File Structure

### Naming Conventions for Files

| Type | Convention | Example |
|---|---|---|
| Page | `page.tsx` (Next.js convention) | `app/about/page.tsx` |
| Layout | `layout.tsx` | `app/layout.tsx` |
| Component | PascalCase | `HeroSection.tsx` |
| Hook | camelCase with `use` prefix | `useScrollPosition.ts` |
| Utility | camelCase | `utils.ts` |
| Type file | camelCase | `project.ts` |
| Constant file | camelCase | `constants.ts` |

### Component File Anatomy

Every component follows this internal structure:

```tsx
// components/ui/Button.tsx

import { FC } from 'react'
import { cn } from '@/lib/utils'

// 1. Types
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// 2. Component
const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
}) => {
  const base = 'uppercase tracking-widest font-normal rounded-brand-sm transition-all duration-250'

  const variants = {
    primary:   'bg-gold-primary hover:bg-gold-deep hover:shadow-gold text-blush',
    secondary: 'border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-blush',
  }

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-8 py-3',
    lg: 'text-base px-10 py-4',
  }

  return (
    <button
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}

export default Button
```

### `lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

---

## 11. Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gold-primary':   '#D4920A',
        'gold-highlight': '#F5B931',
        'gold-deep':      '#A8720A',
        'midnight':       '#0D1B2A',
        'ink':            '#1A1A1A',
        'stone':          '#777777',
        'blush':          '#FDF3DC',
      },
      fontFamily: {
        sans: ['Radikal', 'sans-serif'],
      },
      borderRadius: {
        'brand-sm': '4px',
        'brand-md': '8px',
        'brand-lg': '16px',
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(13, 27, 42, 0.12)',
        'brand-md': '0 4px 16px rgba(13, 27, 42, 0.16)',
        'brand-lg': '0 8px 32px rgba(13, 27, 42, 0.20)',
        'gold':     '0 4px 20px rgba(212, 146, 10, 0.25)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 12. Naming Conventions

### Components
- PascalCase for all component names and files: `HeroSection`, `ProjectCard`
- Suffix page-level sections with `Section`: `AboutSection.tsx`
- Suffix primitives with their type where it helps: `SectionHeading`, `ProjectCard`

### CSS / Tailwind Classes
- Prefer composition with `cn()` over messy inline ternaries
- Group classes in this order: layout → spacing → typography → color → interaction

```tsx
// Good — grouped and readable
className={cn(
  'flex items-center gap-4',                           // layout
  'px-8 py-4',                                         // spacing
  'text-sm font-normal uppercase tracking-widest',     // typography
  'text-blush bg-midnight',                            // color
  'hover:text-gold-primary transition-colors duration-150' // interaction
)}
```

### Variables & Functions
- camelCase for variables and functions: `fetchProjects`, `projectSlug`
- SCREAMING_SNAKE_CASE for true constants: `SITE_NAME`, `CONTACT_EMAIL`
- PascalCase for types and interfaces: `ProjectType`, `ButtonProps`

### Routes / URLs
- Lowercase, hyphenated slugs: `/our-projects`, `/contact-us`

---

## 13. Component Architecture

Three layers — keep them separate:

```
Page  (app/*/page.tsx)
  └── Sections  (components/sections/*.tsx)    ← layout & composition
        └── UI Primitives  (components/ui/*.tsx) ← pure, reusable, no data
```

**Rules:**
- `ui/` components are dumb — no data fetching, no business logic
- `sections/` compose UI primitives into page blocks
- Pages assemble sections and handle data fetching (server components)
- `layout/` components (Navbar, Footer, Container) are wired up in `layout.tsx` only

---

## 14. Page Structure Pattern

Every page follows this shell:

```tsx
// app/(marketing)/about/page.tsx
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'

export const metadata: Metadata = {
  title: 'About — Sunrise Multiple Businesses & Housing',
  description: 'Learn about Sunrise and our vision.',
}

export default function AboutPage() {
  return (
    <>
      <HeroSection
        title="About Sunrise"
        subtitle="Building futures since day one."
      />
      <AboutSection />
    </>
  )
}
```

---

## 15. Environment & Config Files

### `.env.example` (commit this, never `.env.local`)

```env
# Site
NEXT_PUBLIC_SITE_URL=https://sunrisenepal.com
NEXT_PUBLIC_SITE_NAME=Sunrise Multiple Businesses & Housing

# Contact / Forms
CONTACT_EMAIL=info@sunrisenepal.com
FORM_SUBMISSION_API=

# Analytics
NEXT_PUBLIC_GA_ID=
```

### `lib/constants.ts`

```ts
export const SITE_NAME = 'Sunrise Multiple Businesses & Housing Pvt. Ltd.'
export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'About',    href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'Contact',  href: '/contact' },
]

export const CONTACT = {
  email:   'info@sunrisenepal.com',
  phone:   '+977-XXXXXXXXXX',
  address: 'Kathmandu, Nepal',
}
```

### `tsconfig.json` path aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This enables clean imports like `@/components/ui/Button` instead of `../../components/ui/Button`.

---

## 16. Git & Branch Strategy

### Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/description` | `feat/hero-section` |
| Fix | `fix/description` | `fix/navbar-mobile` |
| Design | `design/description` | `design/colour-tokens` |
| Content | `content/description` | `content/projects-page` |
| Chore | `chore/description` | `chore/update-deps` |

### Branch Structure

```
main              ← production (auto-deploy)
  └── dev         ← staging / integration
        ├── feat/hero-section
        ├── feat/projects-grid
        └── fix/mobile-nav
```

### Commit Message Format

```
type(scope): short description

feat(hero): add animated headline entrance
fix(navbar): correct mobile menu z-index
design(tokens): update gold shadow values
content(projects): add first 3 project entries
```

### `.gitignore` essentials

```
.env.local
.env*.local
.next/
node_modules/
out/
```

---

*Sections to add next: SEO & metadata patterns, image optimisation guidelines, form handling, CMS integration, accessibility checklist.*
