# Tax Payment Portal

> **Technical Assessment** - Senior Full-Stack Developer Position

A modern web-based tax filing portal for e-residents, built as a technical demonstration showcasing full-stack development capabilities with Next.js 15, TypeScript, Prisma, and modern React patterns.

## About This Project

This project was developed as a technical assessment for a Senior Full-Stack Developer position. It demonstrates the ability to:

- Build a production-ready application from scratch
- Implement complex multi-step form workflows
- Handle authentication and authorization
- Design and implement database schemas
- Create RESTful APIs with proper validation
- Apply modern UI/UX patterns
- Deploy to cloud infrastructure (Vercel + Supabase)

## Live Demo

**Production**: [https://tax-payment-portal.vercel.app](https://tax-payment-portal.vercel.app)

## MVP Features (Completed)

### Authentication System
- Google OAuth integration
- JWT session strategy (Edge-compatible)
- Protected routes with middleware
- Development mode credentials

### Income Tax Return (Annual - Form 1)
- 6-step wizard: Personal Info → Address → Income → Credits → Preparer → Review & Sign
- Real-time tax calculations (5% effective rate)
- Digital signature capture
- Duplicate filing prevention (per tax year)
- PDF download with proper filename

### VAT Return (Quarterly)
- 5-step wizard: Business Info → Period → Sales → Adjustments → Review & Sign
- Real-time VAT calculations (2.5% effective rate)
- Quarter selection with date range display
- Duplicate filing prevention (per year/quarter)
- PDF download with proper filename

### Dashboard
- Filing history with status indicators
- Smart filing cards (shows available periods to file)
- Disabled state when all periods are filed
- View submitted returns with full details
- Returns sorted by year (most recent first)

### Form Validation & UX
- Step-by-step validation with Zod schemas
- Already-filed periods disabled in selectors
- Warning alerts for duplicate attempts
- Improved number input UX (auto-select on focus)
- API-level 409 conflict handling

### API & Backend
- RESTful API routes for CRUD operations
- Service layer pattern (IncomeTaxService, VatService)
- Prisma ORM with PostgreSQL (Supabase)
- Draft support with upsert logic
- Proper error responses with status codes

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.5.9 (App Router) |
| Language | TypeScript 5 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Database | Prisma ORM + Supabase (PostgreSQL) |
| Authentication | NextAuth.js v5 (Auth.js) |
| Signatures | signature_pad |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Auth endpoints
│   │   └── tax/
│   │       ├── income/            # Income tax CRUD
│   │       ├── vat/               # VAT CRUD
│   │       └── drafts/            # Draft management
│   ├── auth/                      # Sign-in, error pages
│   ├── dashboard/                 # User dashboard
│   └── tax/
│       ├── income/                # Income tax wizard
│       ├── vat/                   # VAT wizard
│       └── returns/[type]/[id]/   # Return detail views
├── components/
│   ├── auth/                      # SignOutButton, SessionProvider
│   ├── dashboard/                 # TaxFilingCards, TaxReturnsList
│   ├── forms/                     # IncomeTaxForm, VatForm, SignaturePad
│   ├── tax/                       # DownloadPdfButton
│   └── ui/                        # shadcn/ui components
├── hooks/
│   ├── use-income-tax-form.ts     # Income tax form logic
│   └── use-vat-form.ts            # VAT form logic
├── lib/
│   ├── api/                       # API client & endpoints
│   ├── services/                  # Business logic services
│   └── tax-calculations.ts        # Tax computation functions
├── types/                         # TypeScript definitions
├── auth.ts                        # Full auth config (Prisma)
├── auth.config.ts                 # Edge-compatible auth config
└── middleware.ts                  # Route protection
```

## Tax Rates (Próspera ZEDE)

| Tax Type | Presumed Base | Statutory Rate | Effective Rate |
|----------|---------------|----------------|----------------|
| Personal Income | 50% of gross | 10% | **5%** |
| Retail VAT | 50% of sales | 5% | **2.5%** |
| Capital Gains | — | — | **0%** |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Supabase recommended)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd tax-payment-portal

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
pnpm db:generate
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
AUTH_SECRET="your-secret-key"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"

```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |

## Architecture Decisions

### Clean Code Principles
The codebase follows clean code practices throughout:
- **Presentation-only components**: UI components handle rendering only, no business logic
- **Business logic in hooks**: Custom hooks encapsulate all form logic, calculations, and state management
- **Service layer**: Backend operations abstracted into services for testability and reusability

### Centralized Types
All TypeScript types and interfaces are centralized in `/src/types/`:
- Shared between frontend and backend
- Single source of truth for data structures
- Facilitates refactoring and maintenance

### Decoupled API Architecture
The API client (`/src/lib/api/`) is designed for backend substitution:
- Abstract client interface that can point to internal Next.js routes or external APIs
- `BASE_URL` environment variable for easy backend switching
- Standardized request/response format across all endpoints
- Ready to evolve from Next.js API routes to a dedicated backend (Node.js, Go, etc.)

```typescript
// Easy to switch from internal to external API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
```

### Edge-Compatible Authentication
Split auth configuration to keep middleware under Vercel's 1MB Edge Function limit:
- `auth.config.ts` - Lightweight config for Edge Runtime (no Prisma)
- `auth.ts` - Full config with Prisma adapter for API routes

### JWT Sessions
Using JWT strategy instead of database sessions for:
- Edge Runtime compatibility
- Reduced database queries
- Simpler session management

### Service Layer Pattern
Business logic encapsulated in services (`IncomeTaxService`, `VatService`) for:
- Separation of concerns
- Testability
- Reusability across API routes

### Form State Management
Custom hooks (`useIncomeTaxForm`, `useVatForm`) managing:
- Multi-step navigation
- Real-time calculations
- Validation per step
- Duplicate filing detection
- API error handling (409 conflicts)

### UX Considerations
- Number inputs auto-select on focus for better editing experience
- Already-filed periods disabled with clear visual indicators
- Warning alerts prevent duplicate submissions
- PDF downloads with professional filenames
- Returns sorted by most recent first

## Future Enhancements

These features were identified but not implemented due to scope:

- [ ] Payment integration (Stripe, BTCPay Server)
- [ ] Email notifications (confirmations, reminders)
- [ ] Draft auto-save
- [ ] Admin dashboard
- [ ] Business entity tax forms
- [ ] Tax amendments
- [ ] Multi-language support (Spanish/English)

## Author

Developed by **Oscar Fonseca** as a technical assessment.

- GitHub: [@edsphinx](https://github.com/edsphinx)
- LinkedIn: [Oscar Fonseca](https://www.linkedin.com/in/ofonck/)

## License

This project was created for evaluation purposes. All rights reserved.
