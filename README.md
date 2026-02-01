# Próspera Tax Payment Portal

A modern web-based tax filing experience for Próspera ZEDE residents, built with Next.js, shadcn/ui, and Prisma.

## Overview

This portal allows Próspera residents to file their taxes digitally, replacing the traditional Adobe Sign PDF forms with a streamlined, multi-step web experience.

### Tax Types Supported

1. **Income Tax (Annual)** - Form 1
   - Due: April 30th yearly
   - Effective rate: 5% of gross income
   - Calculation: 50% of gross income deemed "presumed income", taxed at 10%

2. **VAT Return (Quarterly)**
   - Due: 15 days after each quarter end
   - Effective rate: 2.5% of retail sales
   - Calculation: 50% of retail sales deemed "value added", taxed at 5%

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Database**: Prisma ORM (PostgreSQL)
- **Signatures**: signature_pad library

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Run development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
```

## Project Structure

```
tax-payment-portal/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   └── tax/
│   │       ├── income/     # Income tax form
│   │       └── vat/        # VAT form
│   ├── components/
│   │   ├── forms/          # Tax form components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts           # Prisma client
│   │   ├── utils.ts        # Utility functions
│   │   ├── tax-calculations.ts  # Tax calculation logic
│   │   └── validations/    # Zod schemas
│   └── types/              # TypeScript types
└── ...
```

## Design Decisions

### Multi-Step Form Approach
- Breaks complex tax forms into digestible steps
- Reduces cognitive load for users
- Allows step-by-step validation
- Provides clear progress indication

### Field Grouping
- **Personal Info**: Identity and contact details
- **Address**: Residence information
- **Income/Sales**: Financial data entry
- **Credits**: Tax adjustments
- **Review**: Summary and certification

### UX Improvements over PDF Forms
1. **Real-time calculations**: Users see tax estimates as they enter data
2. **Inline validation**: Immediate feedback on errors
3. **Progress tracking**: Clear indication of completion
4. **Digital signature**: Canvas-based signature capture
5. **Mobile-friendly**: Responsive design for all devices
6. **Zero-filing support**: Easy submission when no income/sales

## Legal Compliance

The portal captures all legally required information from the original Adobe Sign forms:
- Taxpayer identification (Resident ID)
- Tax period selection
- Income/sales reporting
- Tax calculation with credits
- Certification under penalty of perjury
- Digital signature

## Tax Rates (Próspera ZEDE)

| Tax Type | Presumed Rate | Statutory Rate | Effective Rate |
|----------|--------------|----------------|----------------|
| Personal Income | 50% of gross | 10% | 5% |
| Business Income | 10% of revenue | 10% | 1% |
| Retail VAT | 50% of sales | 5% | 2.5% |

## Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Payment integration (Stripe/Crypto)
- [ ] PDF generation for filed returns
- [ ] Email notifications
- [ ] Business entity tax forms
- [ ] Admin dashboard
- [ ] Tax history and amendments

## Resources

- [Próspera Tax System](https://pzgps.hn/prospera-zede-tax-system/)
- [Filing Taxes in ePróspera](https://intercom.help/prospera-c3520d800849/en/articles/8839221-filing-taxes-in-eprospera)
- [Tax Overview](https://intercom.help/prospera-c3520d800849/en/articles/8258630-overview-of-taxes)

## License

Proprietary - Próspera ZEDE
# tax-payment-portal
