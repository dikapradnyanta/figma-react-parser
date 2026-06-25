# Plan: Primakara E-Learning Mobile App Prototype

## Context
The user attached a complete, detailed design spec (`src/imports/pasted_text/elearning-app-prototype.md`) for a mobile UI prototype of a university e-learning app — "Primakara E-Learning" for Universitas Primakara. The goal is a presentation-ready, pixel-faithful interactive prototype with 4 screens connected by a bottom navigation bar, plus an in-quiz exam state. This is a pure-frontend prototype (no backend/Supabase needed) with hardcoded, realistic Indonesian placeholder content.

## Approach
Build a single mobile-framed React app (375×812 viewport, centered on a slate background) where the 4 bottom-nav tabs swap the active screen via React `useState` (no router needed). All design tokens (colors, radii, shadow) come straight from the spec. Use `lucide-react` for icons. Custom components are appropriate here since the spec demands exact styling not covered by the shadcn kit.

### Design tokens (used inline / via a shared constants module)
- Primary `#0D3B66`, Accent `#4A90E2`, BG `#F4F6F9`, Card `#FFFFFF`, Text `#1F2937`, Caption `#6B7280`, Alert `#EF4444`
- Radii: cards 16px, buttons/inputs 12px, badges 30px (full)
- Shadow: `0 4px 12px rgba(0,0,0,0.03)`
- Font: Inter (added via `src/styles/fonts.css` Google Fonts import + applied on the app root)

## Files to create/modify
- `src/styles/fonts.css` — add Inter `@import` at top.
- `src/app/App.tsx` — mobile frame shell; holds active-tab state; renders the active screen + `BottomNav`. Centers a 375×812 device frame on a `#F4F6F9`/grey backdrop.
- `src/app/components/phone-frame.tsx` — reusable 375×812 rounded device container with status-bar spacing.
- `src/app/components/bottom-nav.tsx` — 4 tabs (Home, Book, Quiz, Forum) using lucide icons; active `#0D3B66`, inactive `#6B7280`; 64px height + safe area.
- `src/app/components/screens/home-screen.tsx` — Screen 1: deep-blue header (greeting, name, bell+red dot), capsule search bar, "Mata Kuliah Aktif" section, 2-col grid of 4 course cards with progress bars.
- `src/app/components/screens/materials-screen.tsx` — Screen 2: header with back arrow + subtitle, linear list of 5 material cards (PDF/video icon, title, lecturer·size/duration, download circle icon).
- `src/app/components/screens/quiz-screen.tsx` — Screen 3: manages local state between **State A** (quiz list of 3 cards with Aktif/Selesai badges + Mulai Kuis/Lihat Nilai buttons) and **State B** (active exam: blue timer bar, "Soal 3 dari 10", question card, 4 option cards with B selected, "Soal Selanjutnya" button). "Mulai Kuis" switches to State B; a back affordance returns to the list.
- `src/app/components/screens/forum-screen.tsx` — Screen 4: header with edit/plus icon, pill tab filter (Semua/MPTI/RPL/Basis Data), 3–4 thread cards (avatar initials, name·time, title, 2-line preview, replies/likes row), and a circular FAB (+) bottom-right.
- `src/app/components/course-data.ts` (optional) — shared mock data arrays (courses, materials, quizzes, threads) to keep screens clean.

## Key implementation notes
- Tab state lives in `App.tsx`; `BottomNav` receives `active` + `onChange`. Quiz exam state is local to `quiz-screen.tsx`.
- Avatars use colored circle + initials (no images needed). No external images required overall; if any decorative imagery is wanted later, use `ImageWithFallback`.
- Per project rules, avoid Tailwind font-size/weight/line-height utilities except where the spec explicitly dictates type scale — apply those via inline styles to hit the exact pt sizes/weights from the spec.
- Progress bars: simple div track + filled div at width % in accent blue.
- Make tabs/filters/options interactive (selectable) so the demo feels alive.

## Verification
- The Vite dev server is already running; view the result in the Make preview surface (not localhost).
- Click through all 4 bottom-nav tabs and confirm each screen matches the spec.
- On the Kuis tab, tap "Mulai Kuis" to confirm transition to the exam State B, and that returning works.
- Confirm forum pill filters and quiz answer options respond to taps.
- Visually check colors, 16px card radius, soft shadow, and the 375×812 frame against the spec.
