---
name: Khoa Học Tự Nhiên 9
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3e4948'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7979'
  outline-variant: '#bec9c8'
  surface-tint: '#016a6a'
  primary: '#005454'
  on-primary: '#ffffff'
  primary-container: '#0d6e6e'
  on-primary-container: '#9dedec'
  inverse-primary: '#84d4d3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#00479c'
  on-tertiary: '#ffffff'
  tertiary-container: '#005eca'
  on-tertiary-container: '#d3dfff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0f0f0'
  primary-fixed-dim: '#84d4d3'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered specifically for Vietnamese Grade 9 students (ages 14–15) and STEM educators navigating the integrated Natural Sciences curriculum (*Khoa học tự nhiên 9*). The brand identity bridges academic rigor with motivational clarity, balancing the three scientific pillars—Physics (*Vật lí*), Chemistry (*Hóa học*), and Biology (*Sinh học*)—in a coherent, low-friction interface.

The design philosophy combines **Clean Contemporary SaaS** with **Soft Academic Warmth**. It eliminates the visual chaos often found in test-prep software, replacing it with disciplined negative space, approachable roundness, and high-legibility typographic hierarchies. The interface must inspire scientific curiosity, instill confidence during high-stakes national exam preparation, and provide teachers with a structured, non-fatiguing workspace.

## Colors

The palette establishes an authoritative yet welcoming visual tone:

- **Primary (`#0D6E6E` - Deep Scientific Teal):** Serves as the bedrock brand color. Communicates scientific inquiry, focus, and institutional credibility. Used for primary calls-to-action, active navigation tabs, major headers, and completion anchors.
- **Secondary (`#F59E0B` - Warm Amber):** An energetic companion used strategically for high-value motivators: gamification streaks, XP badges, mastery milestones, tips, and attention-required callouts.
- **Tertiary (`#3B82F6` - Science Sky / Soft Indigo):** Dedicated to curriculum taxonomy and multi-discipline cross-referencing (e.g., Physics module tags, interactive formula tools, informational link anchors).
- **Neutral Palette (`#475569` base):** Ranging from Canvas White (`#FFFFFF`) and Off-Canvas Tint (`#FAFCFC`) to Surface Gray (`#F1F5F7`), Border Slate (`#E2E8F0`), and Deep Text Ink (`#0F172A`).
- **Semantic Accents:**
  - Success / Correct Answer: `#10B981` (Emerald)
  - Destructive / Error / Countdown Urgent: `#EF4444` (Crimson)
  - Discipline Badges: Physics (`#3B82F6`), Chemistry (`#8B5CF6`), Biology (`#10B981`)

## Typography

**Be Vietnam Pro** is selected across all roles. Designed explicitly for the Vietnamese language, it provides pristine optical balancing for stacked diacritics (e.g., *ẩ, ễ, ặ, ứ*), preventing vertical line-clipping and uneven line heights in educational problem statements and scientific passages.

- **Scale & Rhythm:** Uses a generous vertical leading (1.5–1.625 for body text) to accommodate scientific notation, chemical formulas ($H_2SO_4$), and complex Vietnamese tone marks.
- **Hierarchy:** High-weight headers (`600` and `700`) anchor the page structure, while `400` weights preserve readability in multi-step solution guides and exercise sets.

## Layout & Spacing

The layout is built on a responsive 12-column grid on desktop (max width `1280px`, centered) transitioning to an 8-column grid on tablet, and a single-column layout on mobile devices.

- **Breakpoints:**
  - Mobile: `< 640px` (Margins: `1rem`, Gutters: `1rem`)
  - Tablet: `640px – 1024px` (Margins: `1.5rem`, Gutters: `1.25rem`)
  - Desktop: `> 1024px` (Margins: `2rem`, Gutters: `1.5rem`)
- **Spacing Rhythm:** Based on a strict `4px`/`8px` increment. Lesson views prioritize comfortable reading widths (`max-w-3xl` or ~65–75 characters per line), avoiding wide-span multi-column eye fatigue during exercise drills.

## Elevation & Depth

Visual hierarchy uses **tonal surfaces** paired with soft, low-contrast **ambient shadows** rather than hard structural lines.

- **Base Canvas:** `#FAFCFC` provides a warm, glare-free background for prolonged reading sessions.
- **Surface Elevation 1 (Resting Cards):** `#FFFFFF` background bound by a crisp `1px` border of `#E2E8F0` with a subtle diffused shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Surface Elevation 2 (Interactive Cards & Popovers):** Shadow expands on hover/active state to `0 8px 24px -4px rgba(13, 110, 110, 0.08)`, shifting upward slightly (`-2px` translate) to provide tactile affordance for 14-year-old learners.
- **Surface Elevation 3 (Modals & Question Overlays):** Deep ambient spread `0 20px 30px -10px rgba(15, 23, 42, 0.12)` layered above a translucent backdrop (`rgba(15, 23, 42, 0.4)` with `4px` blur).

## Shapes

The geometric signature uses **Rounded Level 2** (`8px` base, scaling to `16px` and `24px` for structural modules). 

- Standard inputs and buttons utilize `rounded-xl` (`12px` to `14px`) to remove sharpness and create friendly interaction points.
- Exercise cards, module containers, and experiment simulation wrappers adopt `rounded-2xl` (`16px` to `20px`).
- Badges, tags, and progress bars adopt fully circular or pill contours (`rounded-full`) to contrast against rectangular content blocks.

## Components

### Buttons
- **Primary Button:** Background `#0D6E6E`, text `#FFFFFF`, font weight `600`, minimum touch target `48px` (height). Hover: `#0F766E`, Active: `#115E59`. Rounded `12px`.
- **Secondary / Action Button:** Warm Amber `#F59E0B` for action gates (e.g., *Nộp bài*, *Bắt đầu luyện tập*). Text `#FFFFFF` or high-contrast deep amber `#78350F`.
- **Ghost / Outline Button:** `#FFFFFF` background, border `1.5px` `#E2E8F0`, text `#334155`. Hover brings soft teal wash (`#F0FDFA`) and border tint (`#99F6E4`).

### Subject Badges & Chips
- Compact, non-intrusive metadata capsules for subject categorization:
  - **Vật lí (Physics):** `#EFF6FF` background, `#1D4ED8` text, `#BFDBFE` border.
  - **Hóa học (Chemistry):** `#F5F3FF` background, `#6D28D9` text, `#DDD6FE` border.
  - **Sinh học (Biology):** `#ECFDF5` background, `#047857` text, `#A7F3D0` border.
- Height: `26px`, font size `12px`, padding `0 10px`, weight `600`, pill-shaped (`rounded-full`).

### Multiple-Choice Exercise Options (Cards)
- Minimum height `56px` to allow easy tap targets on tablets and phones.
- **Resting:** Background `#FFFFFF`, border `1.5px solid #E2E8F0`, text `#1E293B`.
- **Selected:** Background `#F0FDFA`, border `2px solid #0D6E6E`, text `#0D6E6E`.
- **Correct State:** Background `#ECFDF5`, border `2px solid #10B981`, leading checkmark in Emerald.
- **Incorrect State:** Background `#FEF2F2`, border `2px solid #EF4444`, text `#991B1B`.

### Input Fields
- Height `48px`, font size `16px` (prevents iOS Safari zoom-in).
- Neutral background `#FFFFFF`, border `1px solid #CBD5E1`, rounded `12px`.
- Focus ring: `3px` offset with `#0D6E6E` at `20%` opacity, border color `#0D6E6E`.

### Cards & Problem Containers
- Background `#FFFFFF`, border `1px solid #E2E8F0`, padding `20px` to `28px`, `rounded-2xl`.
- Headers within problem cards maintain clear distinction between the question prompt and supporting diagrams/formula blocks.

### Progress & Formula Modules
- **Progress Bar:** Track `#E2E8F0` (`height: 8px`, `rounded-full`), indicator `#0D6E6E` transition-all duration-300. XP/Milestone variations use `#F59E0B`.
- **Formula & Equation Boxes:** Dedicated callout container with `#F8FAFC` background, left accent border `4px solid #0D6E6E`, monospaced/clear math typographic scale.