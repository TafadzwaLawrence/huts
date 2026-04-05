# Huts Workspace Organization

## Root Directory Structure

```
Huts/
├── app/                    # Next.js App Router (pages, routes, API endpoints)
├── components/             # React components (organized by feature)
├── docs/                   # 📁 ALL project documentation (13 guides)
├── data/                   # 📁 Raw data files (CSV, geospatial, analytics)
├── emails/                 # Email templates
├── lib/                    # Utility functions, clients, helpers
├── public/                 # Static assets (images, fonts, favicons)
│   ├── fonts/              # 📁 Google Sans and font files
│   └── favicons/           # 📁 Favicons and design assets
├── scripts/                # Dev scripts and generators
│   ├── config/             # 📁 Configuration utilities
│   └── ...
├── supabase/               # Database migrations and configuration
├── types/                  # TypeScript type definitions
├── archive/                # Old/deprecated code (kept for reference)
├── node_modules/           # Dependencies (npm)
├── .github/                # GitHub config, copilot-instructions.md
│   └── copilot-instructions.md  # Coding guidelines and patterns
├── .env.local              # ⚠️ Secret environment variables
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment configuration
```

## What Was Organized

### ✅ Created Folders
- **`/docs`** — All 13 markdown documentation files moved here
- **`/data`** — All data files (CSV, geospatial, analytics exports) moved here
- **`/public/fonts`** — Font files (Google Sans.zip) moved here  
- **`/public/favicons`** — All favicon and design assets consolidated here
- **`/scripts/config`** — Configuration helper utilities

### 📋 Documentation Index
See **[docs/README.md](docs/README.md)** for a complete guide to all documentation files.

### 📊 Data Files Reference
See **[data/README.md](data/README.md)** for information about raw data files.

### 🎨 Assets Reference
See **[public/favicons/README.md](public/favicons/README.md)** for favicon and design assets.

---

## Development Quick Links

- **Code Guidelines & Patterns** → [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Database Schema** → [docs/DATABASE.md](docs/DATABASE.md)
- **Project Roadmap** → [docs/ROADMAP.md](docs/ROADMAP.md)
- **SEO Strategy** → [docs/SEO_GUIDE.md](docs/SEO_GUIDE.md)

## Root-Level Files Only

Now at root only: configuration files, build outputs, and git metadata (which belong there).
