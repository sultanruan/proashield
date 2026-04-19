# ProaShield — Frontend Design Skill

## Product Context

ProaShield is "The Professional Robinson List" — an AI-powered outreach firewall
for senior executives. The audience is C-suite, VPs, and founders at Series A-D 
tech companies. They are sophisticated, time-poor, and have high aesthetic standards.

The product has two distinct surfaces:
- **Exec side** (dashboard, onboarding): where the executive manages their Shield
- **Public page** (proashield.com/username): what senders see before the chat

Both must feel premium, trustworthy, and purposeful. This is not a consumer app.
It is a professional tool that signals "my time has a process."

---

## Aesthetic Direction

**Theme**: Refined minimalism. Clean, spacious, intentional.  
**Reference products**: Linear, Vercel dashboard, Stripe, Raycast, Notion.  
**One word**: Trustworthy.

The design should make an exec feel: "This represents me well."  
The design should make a sender feel: "This person takes their time seriously."

---

## Color System

```css
:root {
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --bg-tertiary: #F4F4F5;

  /* Text */
  --text-primary: #09090B;
  --text-secondary: #52525B;
  --text-tertiary: #A1A1AA;

  /* Accent — Teal */
  --accent: #0EA5E9;
  --accent-hover: #0284C7;
  --accent-light: #E0F2FE;
  --accent-subtle: #F0F9FF;

  /* Borders */
  --border: #E4E4E7;
  --border-strong: #D4D4D8;

  /* Semantic */
  --pass: #10B981;      /* green — pass verdict */
  --pass-light: #ECFDF5;
  --hold: #F59E0B;      /* amber — hold verdict */
  --hold-light: #FFFBEB;
  --fail: #6B7280;      /* grey — fail verdict (not alarming) */
  --fail-light: #F9FAFB;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
}
```

---

## Typography

```css
/* Import in layout.tsx */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

:root {
  --font-sans: 'DM Sans', sans-serif;
}

/* Scale */
--text-xs: 0.75rem;    /* 12px — labels, badges */
--text-sm: 0.875rem;   /* 14px — secondary text, captions */
--text-base: 1rem;     /* 16px — body */
--text-lg: 1.125rem;   /* 18px — subheadings */
--text-xl: 1.25rem;    /* 20px — section titles */
--text-2xl: 1.5rem;    /* 24px — page headings */
--text-3xl: 1.875rem;  /* 30px — hero headings */
```

Use **DM Sans** throughout. It's friendlier than Inter but still professional.
Weight 400 for body, 500 for emphasis, 600 for headings and CTAs.

---

## Layout Principles

### Onboarding (exec setup flow)
- Single column, max-width 560px, centered
- Generous padding: 48px top, 32px sides on mobile
- One concept per screen — no scrolling needed on desktop
- Progress bar: thin (3px), teal fill, animated
- Step transitions: slide left/right with framer-motion, 280ms ease-out

### Dashboard (exec)
- Sidebar (240px) + main content area
- Dark sidebar (#09090B) with light text — creates a clear hierarchy
- Main content: white background, generous padding (32px)
- Cards: white, 1px border (#E4E4E7), 12px radius, subtle shadow

### Public page (sender-facing)
- Full-page centered, max-width 480px
- Light mode — welcoming, not intimidating
- Chat interface: iMessage-style bubbles
  - AI messages: left, light grey background (#F4F4F5)
  - Sender messages: right, teal background (#0EA5E9), white text

---

## Component Patterns

### Buttons
```tsx
/* Primary */
className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium 
           px-5 py-2.5 rounded-lg text-sm transition-colors duration-150
           disabled:opacity-40 disabled:cursor-not-allowed"

/* Secondary */
className="bg-white hover:bg-[#F4F4F5] text-[#09090B] font-medium 
           px-5 py-2.5 rounded-lg text-sm border border-[#E4E4E7] 
           transition-colors duration-150"

/* Ghost / Skip */
className="text-[#A1A1AA] hover:text-[#52525B] text-sm 
           transition-colors duration-150 underline-offset-4 
           hover:underline"
```

### Input fields
```tsx
className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] 
           bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA]
           focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] 
           focus:ring-offset-0 focus:border-transparent
           transition-shadow duration-150"
```

### Toggle chips (category selection)
```tsx
/* Unselected */
className="px-3.5 py-1.5 rounded-full border border-[#E4E4E7] 
           bg-white text-[#52525B] text-sm cursor-pointer
           hover:border-[#0EA5E9] hover:text-[#0EA5E9]
           transition-all duration-150"

/* Selected */
className="px-3.5 py-1.5 rounded-full border border-[#0EA5E9] 
           bg-[#E0F2FE] text-[#0EA5E9] text-sm font-medium cursor-pointer
           transition-all duration-150"
```

### Verdict badges
```tsx
/* Pass */
className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] 
           text-xs font-medium"

/* Hold */
className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] 
           text-xs font-medium"

/* Fail */
className="px-2.5 py-0.5 rounded-full bg-[#F9FAFB] text-[#6B7280] 
           text-xs font-medium"
```

### Card
```tsx
className="bg-white rounded-xl border border-[#E4E4E7] p-6 
           shadow-[0_1px_2px_0_rgb(0,0,0,0.05)]
           hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.07)] 
           transition-shadow duration-200"
```

---

## Motion

Use **framer-motion** for:
- Step transitions in onboarding (slide left/right)
- Page load animations (subtle fade + translate up, staggered)
- Chat bubbles (fade + slide in from direction)
- Success states (scale + fade)

```tsx
/* Standard page entrance */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}
const pageTransition = { duration: 0.25, ease: 'easeOut' }

/* Onboarding step — forward */
const stepVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 }
}
```

---

## Micro-details that matter

- **Focus states**: always visible, teal ring, no outline
- **Loading states**: skeleton screens, not spinners (except for AI thinking)
- **Empty states**: helpful, not just "No data". Tell the exec what to do.
- **Error messages**: inline, below the field, small red text — never alerts
- **Hover lift on cards**: subtle translateY(-1px) + shadow increase
- **Active states on buttons**: slight scale(0.98)
- **Transitions**: always 150ms for colors, 200ms for transforms
- **Border radius**: 8px for inputs/buttons, 12px for cards, 9999px for badges/chips

---

## Proa Brand Elements

**Logo**: Text "proashield" lowercase, DM Sans 600, teal color (#0EA5E9).  
Add a small shield SVG icon to the left.

```tsx
// Logo component
<div className="flex items-center gap-2">
  <ShieldCheck className="w-5 h-5 text-[#0EA5E9]" strokeWidth={2} />
  <span className="font-semibold text-[#09090B] tracking-tight">
    proa<span className="text-[#0EA5E9]">shield</span>
  </span>
</div>
```

**"Protected by Proa" badge** (used on public page):
```tsx
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 
                rounded-full bg-[#F0F9FF] border border-[#BAE6FD]">
  <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" />
  <span className="text-xs font-medium text-[#0369A1]">Protected by Proa</span>
</div>
```

---

## What to avoid

- No purple gradients
- No dark backgrounds on the exec onboarding (light mode only)
- No generic illustrations or stock icon packs
- No excessive animations that feel like a demo
- No rounded corners bigger than 16px
- No font sizes smaller than 12px
- No placeholder text that's too long
- No full-width buttons on desktop (max-width 400px for CTAs)
