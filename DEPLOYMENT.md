# White Label EC Site - Deployment Guide

## Prerequisites

- Node.js 18+
- Supabase project (https://supabase.com)
- Stripe account (https://stripe.com)
- Resend account for email (https://resend.com)
- Vercel account for hosting (https://vercel.com)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url> my-store
cd my-store
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

**Required:**
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | From email (e.g., `My Store <noreply@yourdomain.com>`) |
| `ADMIN_NOTIFICATION_EMAIL` | Email for admin order notifications |
| `NEXT_PUBLIC_SITE_NAME` | Your store name |
| `DEFAULT_SHOP_SLUG` | Unique slug for your shop in the database |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `NEXT_PUBLIC_BASE_URL` | Your site URL |

**Optional - Branding:**
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_DESCRIPTION` | "Online Store" | Site description / tagline |
| `NEXT_PUBLIC_LOGO_URL` | null | URL to logo image (uses text if not set) |
| `ORDER_PREFIX` | "OR" | Prefix for order numbers (e.g., "OR" -> OR1ABC2D) |

**Optional - Theme:**
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_THEME_PRIMARY` | #111111 | Primary brand color |
| `NEXT_PUBLIC_THEME_ACCENT` | #111111 | Accent color |
| `NEXT_PUBLIC_THEME_MEMBER` | #00A8A0 | Member/premium color |

**Optional - Features:**
| Variable | Default | Description |
|----------|---------|-------------|
| `FEATURE_MEMBERSHIP` | false | Enable premium membership program |
| `FEATURE_MEMBERSHIP_SSO` | false | Enable SSO with external membership app |
| `MEMBERSHIP_URL` | "" | URL to membership signup page |
| `MEMBERSHIP_NAME` | "Premium" | Display name for membership tier |
| `MEMBERSHIP_SSO_SECRET` | "" | HMAC secret for SSO token verification |
| `FEATURE_DIGITAL` | true | Enable digital items |
| `FEATURE_PARTNERS` | true | Enable partner marketplace |
| `FEATURE_BIRTHDAY_COUPONS` | true | Enable birthday coupons |

### 3. Database Setup

```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Run all migrations
npx supabase db push
```

### 4. Seed Initial Data

Create your shop in the Supabase dashboard or via SQL:

```sql
INSERT INTO shops (name, slug, is_published, status)
VALUES ('Your Store Name', 'your-slug', true, 'active');
```

Make sure `DEFAULT_SHOP_SLUG` in `.env.local` matches the slug you chose.

### 5. Stripe Webhook

Set up a Stripe webhook pointing to `https://yourdomain.com/api/stripe/webhook` with the following events:
- `checkout.session.completed`
- `payment_intent.succeeded`

### 6. Local Development

```bash
npm run dev
```

### 7. Deploy to Vercel

```bash
vercel
```

Or connect your repository to Vercel and configure environment variables in the Vercel dashboard.

## Architecture Overview

```
src/
  site.config.ts          # Centralized site configuration
  lib/
    constants.ts          # Re-exports from site.config
    shop.ts               # Shop operations
    email.ts              # Email templates (uses site.config)
    types.ts              # TypeScript types
  features/
    membership-sso/       # Optional SSO integration
  components/
    layout/               # Header, Footer (branded)
    ui/                   # MemberCTA, MemberBadge, etc.
    product/              # Product cards, forms
    admin/                # Admin components
  app/
    page.tsx              # Home page (branded)
    admin/                # Admin dashboard
    shop/                 # Store pages
    cart/                 # Shopping cart
    checkout/             # Checkout flow
```

## Feature Configuration Examples

### Minimal Store (no membership)
```env
NEXT_PUBLIC_SITE_NAME=Simple Shop
DEFAULT_SHOP_SLUG=main
ADMIN_EMAILS=admin@example.com
```

### Full-Featured Store (with membership)
```env
NEXT_PUBLIC_SITE_NAME=Premium Store
FEATURE_MEMBERSHIP=true
FEATURE_MEMBERSHIP_SSO=true
MEMBERSHIP_URL=https://membership.example.com
MEMBERSHIP_NAME=VIP
MEMBERSHIP_SSO_SECRET=your-secret
NEXT_PUBLIC_THEME_MEMBER=#FF6B35
```
