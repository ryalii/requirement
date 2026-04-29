# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev     # Start dev server (port 3000)
pnpm build   # Production build
pnpm lint    # ESLint
```

No test suite is configured.

## Architecture

This is a frontend-only R&D requirement management system (需求管理系统) built with **Next.js 16 App Router**, **React 19**, **Tailwind CSS 4**, and **shadcn/ui** (new-york style). It was bootstrapped by [v0](https://v0.app) and linked to that project for further AI-assisted development.

**There is no backend, database, or real auth.** All data comes from `lib/mock-data.ts` — a ~1000-line file of hardcoded mock data. Create/update/delete operations mutate local React state only and log to console. Login accepts `admin@example.com` / `admin123` with no token or session.

### Domain model

The system tracks requirements in a decomposition hierarchy:

```
LMT (Market Requirement) → IR (Initial Requirement) → SR (System Requirement) → AR (Application Requirement) → Test Cases
```

Other domain entities: **Task**, **Project**, **Version**, **Iteration**, **ProjectMember**, **OperationLog**. All types are defined in `lib/types.ts`.

### Route structure

| Route | Purpose |
|---|---|
| `/login` | Mock login form |
| `/workspace` | Dashboard with calendar + urgent requirements |
| `/requirements` | Requirement list (CRUD, filter, paginate, CSV export) |
| `/requirements/[id]` | Detail view with recursive tree (IR→SR→AR) |
| `/tasks` | Task list (CRUD, assignment, CSV export) |
| `/projects` | Project list (CRUD, CSV export) |
| `/projects/[id]` | Project detail with version/iteration/AR tree |
| `/projects/versions/[id]` | Version detail |
| `/projects/iterations/[id]` | Iteration detail |

All pages use `"use client"` — there are no server components or server-side data fetching.

### Layout shell

`components/admin-layout.tsx` wraps all main pages with a dark header, a collapsible left sidebar (context-sensitive — switches between workspace/requirements/tasks/project menus based on the current route), and a footer.

### Key details

- **`next.config.mjs`** sets `typescript.ignoreBuildErrors: true` — builds succeed even with type errors.
- **CSV, not Excel:** "Export Excel" buttons generate UTF-8 CSV files with BOM (for Chinese character support), not actual `.xlsx` files.
- **Forms** use `react-hook-form` with `zod` validation (via `@hookform/resolvers`).
- **Charts** use `recharts`.
- **Date handling** uses `date-fns` and `react-day-picker`.
- **UI components** live in `components/ui/` (shadcn/ui primitives with Radix UI).

### Component map

| File | Role |
|---|---|
| `components/admin-layout.tsx` | Main shell: header, sidebar, footer |
| `components/requirements-table.tsx` | Requirement list table |
| `components/requirement-form-dialog.tsx` | Create/edit requirement dialog |
| `components/requirement-tree.tsx` | Recursive IR→SR→AR tree |
| `components/requirement-history-dialog.tsx` | Change history viewer |
| `components/test-cases-table.tsx` | Test case display |
| `components/convert-to-ir-dialog.tsx` | LMT→IR conversion flow |
| `components/decompose-dialog.tsx` | IR/SR decomposition flow |
| `components/theme-provider.tsx` | Dark/light theme via next-themes |
| `lib/mock-data.ts` | All mock data and simulated API functions |
| `lib/types.ts` | All TypeScript interfaces and types |
| `lib/utils.ts` | `cn()` helper for Tailwind class merging |
