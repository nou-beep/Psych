# Psych ✦ — Clinical Psychology Workspace

A vibrant, whimsical, and professional workspace for psychology students, interns, therapists, researchers, and supervisors.

---

## What is Psych?

Psych is a **Next.js web application** built for clinical psychology work. It helps you manage:

- Clinical cases, internship cases, child follow-ups, and adult cases
- Autism internship tracking
- Supervision notes and reflections
- Research participant summaries and qualitative memos
- Assessments and scoring grids
- Printable clinical grids (8 templates)
- Reports: daily, weekly, monthly, one-page, two-page, assessment grid, and final long report structure

Psych is designed to be beautiful and calming — soft pink gradients, rounded cards, sparkle accents — while staying professional enough for university internship submissions and supervisor review.

---

## Running Locally

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 18 or above) installed on your computer.

### Steps

```bash
# 1. Navigate to the project folder
cd psych

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for production

```bash
npm run build
npm run start
```

---

## Deploying to Vercel

1. Push this folder to a GitHub repository named **Psych**
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → Import your GitHub repository
4. Vercel will auto-detect Next.js — no configuration needed
5. Click **Deploy**

Your app will be live at `https://psych-[your-username].vercel.app`.

---

## Project Structure

```
psych/
├── app/                    # All pages (Next.js App Router)
│   ├── page.tsx            # Dashboard
│   ├── cases/              # Cases list + case details
│   ├── checkins/           # Daily, weekly, monthly forms
│   ├── assessments/        # Assessment cards
│   ├── grids/              # 8 printable grid templates
│   ├── reports/            # 7 report types + hub
│   ├── supervision/        # Supervision notes
│   ├── research/           # Research workspace
│   └── settings/           # Theme + preferences
│
├── components/
│   ├── layout/             # Sidebar, Header, MobileNav
│   ├── shared/             # Reusable app components
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── checkins/           # Check-in forms
│   ├── assessments/        # Assessment card
│   ├── grids/              # Printable grid template
│   └── reports/            # PrintableLayout, ReportHeader, ReportSection
│
├── lib/
│   ├── mock-data.ts        # All demo data (replace with Supabase later)
│   ├── themes.ts           # 7 theme definitions
│   └── utils.ts            # cn() utility
│
└── README.md
```

---

## Main Features

| Feature | Description |
|---|---|
| 🎨 7 Themes | Rose Clinic, Sage Mind, Midnight Study, Ocean Notes, Sunset Desk, Soft Lavender, Classic Minimal |
| 📁 Cases | 5 case types, filters, case detail tabs |
| ✅ Check-ins | Daily / Weekly / Monthly forms |
| 🧠 Assessments | 6 assessment cards with status tracking |
| 🖨️ Grids | 8 printable A4 clinical grids |
| 📄 Reports | 7 report types, all print-ready |
| 👥 Supervision | Notes, reflections, ethical concerns |
| 🔬 Research | Qualitative participants, themes, memos |
| ⚙️ Settings | Theme, user info, language, report style |
| 📱 Responsive | Sidebar on desktop, bottom nav on mobile |

---

## Themes

Switch themes from any page using the color swatches in the top-right header.

| Theme | Colors | Best for |
|---|---|---|
| Rose Clinic | Pink, cream, berry | Default — warm and feminine |
| Sage Mind | Sage, ivory, moss | Calm focus |
| Midnight Study | Dark, lavender, charcoal | Night work |
| Ocean Notes | Blue, cyan, slate | Clear and refreshing |
| Sunset Desk | Peach, coral, warm cream | Energetic |
| Soft Lavender | Lavender, white, mauve | Dreamy |
| Classic Minimal | White, gray, black | Professional |

---

## Print System

Every grid and report has a **Print** button. When printed:

- Sidebar, header, and buttons are hidden
- Output is formatted for **A4 paper**
- Clean black/white academic styling (no gradients)
- Signature sections at the bottom of each document

---

## Future Features

- 🔐 **Authentication** — User accounts with Supabase Auth
- 🗄️ **Database** — Save all data to Supabase PostgreSQL
- 📤 **PDF Export** — Export reports as PDF files directly
- 🤖 **AI-assisted report generation** — Use Claude API to draft reports from check-in data
- 🌐 **Multi-language** — Full French and Arabic report generation
- 📊 **Charts** — Visual progress charts from session data
- 📎 **File attachments** — Upload PDFs and documents per case

---

## Important Note

All data in this version is **fictional and anonymized**. Case codes (CASE-001, INT-AP-001, etc.) are demo data only. Psych does not store, transmit, or process real patient information in this version.

Psych is a **clinical support tool** — it does not provide diagnoses, replace clinical supervision, or substitute for professional mental health care.

---

## Built with

- [Next.js 14](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — Icons
- [next-themes](https://github.com/pacocoursey/next-themes) — Theme management

---

*Made with ✦ for psychology students and interns everywhere.*
