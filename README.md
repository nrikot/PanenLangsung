# PanenLangsung

**Platform B2B Hasil Pertanian — Connecting Farmers Directly with Wholesale Buyers**

PanenLangsung is a full-stack agricultural marketplace that eliminates middlemen between Indonesian farmers (petani) and wholesale buyers (pembeli). It features product listings with geo-nearby search, live auctions, request-for-quote (RFQ) negotiations, a 3-tier farmer verification system, escrow-ready order management, and a complete admin panel.

---

## Tech Stack

| Layer        | Technology                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------- |
| Framework    | [Next.js 14](https://nextjs.org/) (App Router)                                              |
| Language     | [TypeScript](https://www.typescriptlang.org/) 5                                             |
| Styling      | [Tailwind CSS](https://tailwindcss.com/) 3.4                                                |
| ORM          | [Prisma](https://www.prisma.io/) 6.19                                                       |
| Database     | PostgreSQL (via [Supabase](https://supabase.com/))                                          |
| Auth         | [Supabase Auth](https://supabase.com/auth) (email/password)                                 |
| Storage      | [Supabase Storage](https://supabase.com/storage) (product photos)                           |
| Forms        | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) v4 validation     |
| State        | [Zustand](https://zustand-demo.pmnd.rs/) 5 + [TanStack Query](https://tanstack.com/query) 5 |
| Icons        | [Lucide React](https://lucide.dev/)                                                         |
| UI Utilities | `clsx` + `tailwind-merge` + `class-variance-authority` (shadcn/ui pattern)                  |
| Scheduling   | Cron endpoint for automated auction closing                                                 |
| Runtime      | Node.js 20                                                                                  |

---

## Features

### For Farmers (_Petani_)

- Product catalog management with photo uploads (up to 10 per product)
- Create and manage auctions (automatic or manual winner selection)
- Browse and respond to buyer RFQs with quotes
- Order management and tracking
- Profile with 3-tier verification status to ensure real producers

### For Buyers (_Pembeli_)

- Browse products with geo-nearby search and filtering
- Place bids on live auctions
- Create RFQs and compare supplier quotes
- Order tracking from packed to delivered
- Profile with business verification status

### For Admins

- User management (farmers and buyers lists with search/pagination)
- Farmer verification approval/rejection workflow
- Product oversight and reassignment
- Auction and RFQ monitoring
- Dispute, transaction and review dashboards (UI stubs)

### Platform

- **Dark/Light theme** — system-aware toggle with CSS custom properties
- **Mobile-first responsive** — hamburger navigation, adaptive layouts
- **Automated auction closing** — cron job auto-activates, closes, and selects winners
- **Indonesia map hero** — custom SVG line-art background on landing page
- **3-tier verification** — document-based farmer identity verification

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/nrikot/PanenLangsung.git
cd PanenLangsung
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project credentials:

| Variable                        | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection string (Supabase pooler) |
| `SUPABASE_URL`                  | Supabase project URL                           |
| `SUPABASE_ANON_KEY`             | Supabase anonymous/public key                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-side only)   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public Supabase URL (client-side)              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (client-side)                  |
| `CRON_SECRET`                   | Random secret for protecting cron endpoints    |
| `MIDTRANS_SERVER_KEY`           | Midtrans payment gateway (future phase)        |
| `MIDTRANS_CLIENT_KEY`           | Midtrans payment gateway (future phase)        |

### 4. Initialize the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Seed sample data

```bash
# Seed database with 70+ products and 11 users
npm run db:seed

# Sync Supabase Auth users (creates auth accounts for seed users)
npm run db:seed-auth
```

### 6. Create Supabase Storage bucket

Create a **public** storage bucket named `products` in your Supabase dashboard (Storage > New Bucket). Set the file size limit to 2MB and allow `image/jpeg`, `image/png` MIME types.

### 7. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Accounts

After running both seed scripts, you can log in with:

| Role   | Email                        | Password                    |
| ------ | ---------------------------- | --------------------------- |
| Admin  | `admin.main@demo.com`        | _EnterYourDemoPasswordHere_ |
| Farmer | `budi.santoso@demo.com`      | _EnterYourDemoPasswordHere_ |
| Farmer | `siti.aminah@demo.com`       | _EnterYourDemoPasswordHere_ |
| Farmer | `agus.wijaya@demo.com`       | _EnterYourDemoPasswordHere_ |
| Farmer | `rina.hartati@demo.com`      | _EnterYourDemoPasswordHere_ |
| Farmer | `dodi.pratama@demo.com`      | _EnterYourDemoPasswordHere_ |
| Buyer  | `siti.rahayu@demo.com`       | _EnterYourDemoPasswordHere_ |
| Buyer  | `herman.kusuma@demo.com`     | _EnterYourDemoPasswordHere_ |
| Buyer  | `darma.food@demo.com`        | _EnterYourDemoPasswordHere_ |
| Buyer  | `exportir.sulawesi@demo.com` | _EnterYourDemoPasswordHere_ |
| Buyer  | `warung.mama@demo.com`       | _EnterYourDemoPasswordHere_ |

---

## Project Structure

```
panen-langsung/
├── prisma/
│   ├── schema.prisma          # 18 models, 19 enums
│   ├── seed.ts                # Database seed (products, users)
│   └── seed-auth.ts           # Supabase Auth sync
├── public/
│   └── images/
│       └── home-indonesia-lineart.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/            # REST API endpoints
│   │   │   │   ├── auth/      # Login, register, profile, verification
│   │   │   │   ├── products/  # CRUD + photo management
│   │   │   │   ├── auctions/  # CRUD + bids + winner selection
│   │   │   │   ├── rfqs/      # CRUD + quotes + winner selection
│   │   │   │   ├── admin/     # User management, verifications
│   │   │   │   ├── commodities/
│   │   │   │   ├── search/    # Geo-nearby search
│   │   │   │   └── upload/
│   │   │   └── cron/          # Scheduled jobs (auction-close)
│   │   ├── admin/             # Admin dashboard + management pages
│   │   ├── lelang/            # Public auction listings
│   │   ├── petani/            # Farmer dashboard + product/auction/RFQ mgmt
│   │   ├── pembeli/           # Buyer dashboard + auction/RFQ browsing
│   │   ├── produk/            # Public product catalog + detail pages
│   │   ├── rfq/               # Public RFQ listings
│   │   ├── masuk/             # Login page
│   │   ├── daftar/            # Registration page
│   │   ├── layout.tsx         # Root layout (ThemeProvider + AuthProvider)
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Theme variables + base styles
│   ├── components/
│   │   ├── Header.tsx         # Responsive nav with hamburger menu
│   │   ├── HeroCTA.tsx        # Auth-aware call-to-action buttons
│   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   ├── DashboardLayout.tsx # Shared dashboard shell
│   │   ├── ProfilePage.tsx    # Reusable profile component
│   │   ├── SupplyChainBg.tsx  # Indonesia map SVG background
│   │   └── ui/pagination.tsx  # Pagination component
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── auth-context.tsx   # AuthProvider + useAuth hook
│       ├── theme-context.tsx  # ThemeProvider + useTheme hook
│       ├── utils.ts           # cn() helper (clsx + tailwind-merge)
│       ├── middleware/        # Auth middleware (withAuth, withRole)
│       ├── supabase/          # Supabase client setup (browser/server)
│       └── validations/       # Zod schemas (auth, product, negotiation)
├── tailwind.config.ts         # Dark mode + custom theme tokens
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## API Endpoints

All endpoints are under `/api/v1/` unless noted otherwise. Authentication is via Supabase JWT Bearer token.

### Auth

| Method   | Endpoint                      | Description                  |
| -------- | ----------------------------- | ---------------------------- |
| `POST`   | `/auth/register`              | Register new user            |
| `POST`   | `/auth/login`                 | Login                        |
| `GET`    | `/auth/me`                    | Get current user             |
| `PUT`    | `/auth/profile`               | Update profile               |
| `GET`    | `/auth/verify/documents`      | List verification documents  |
| `POST`   | `/auth/verify/documents`      | Upload verification document |
| `DELETE` | `/auth/verify/documents/[id]` | Delete verification document |

### Products

| Method   | Endpoint                          | Description                            |
| -------- | --------------------------------- | -------------------------------------- |
| `GET`    | `/products`                       | List products (filter, sort, paginate) |
| `POST`   | `/products`                       | Create product (farmer)                |
| `GET`    | `/products/[id]`                  | Get product detail                     |
| `PUT`    | `/products/[id]`                  | Update product                         |
| `DELETE` | `/products/[id]`                  | Delete product                         |
| `POST`   | `/products/[id]/photos`           | Upload product photo                   |
| `PATCH`  | `/products/[id]/photos/[photoId]` | Update photo (set primary)             |
| `DELETE` | `/products/[id]/photos/[photoId]` | Delete product photo                   |

### Auctions

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| `GET`  | `/auctions`             | List auctions (filter, sort, paginate) |
| `POST` | `/auctions`             | Create auction (farmer)                |
| `GET`  | `/auctions/[id]`        | Get auction detail + bids              |
| `PUT`  | `/auctions/[id]`        | Cancel auction                         |
| `GET`  | `/auctions/[id]/bids`   | List bids                              |
| `POST` | `/auctions/[id]/bids`   | Place/update bid (buyer)               |
| `POST` | `/auctions/[id]/select` | Select winner (farmer, manual mode)    |

### RFQs (Request for Quote)

| Method | Endpoint            | Description                        |
| ------ | ------------------- | ---------------------------------- |
| `GET`  | `/rfqs`             | List RFQs (filter, sort, paginate) |
| `POST` | `/rfqs`             | Create RFQ (buyer)                 |
| `GET`  | `/rfqs/[id]`        | Get RFQ detail + quotes            |
| `PUT`  | `/rfqs/[id]`        | Cancel RFQ                         |
| `GET`  | `/rfqs/[id]/quotes` | List quotes                        |
| `POST` | `/rfqs/[id]/quotes` | Submit/update quote (farmer)       |
| `POST` | `/rfqs/[id]/select` | Select winner (buyer)              |

### Admin

| Method | Endpoint                                 | Description                                       |
| ------ | ---------------------------------------- | ------------------------------------------------- |
| `GET`  | `/admin/users`                           | List users (role/status/search filter, paginated) |
| `GET`  | `/admin/users/[id]`                      | Get user detail                                   |
| `PUT`  | `/admin/users/[id]`                      | Update user                                       |
| `GET`  | `/admin/farmers`                         | List all farmers                                  |
| `GET`  | `/admin/verifications`                   | List pending verifications                        |
| `POST` | `/admin/verifications/[user_id]/approve` | Approve verification                              |
| `POST` | `/admin/verifications/[user_id]/reject`  | Reject verification                               |
| `POST` | `/admin/products/[id]/photos-url`        | Add product photo by URL                          |

### Utilities

| Method | Endpoint              | Description                                                 |
| ------ | --------------------- | ----------------------------------------------------------- |
| `GET`  | `/commodities`        | List commodity categories                                   |
| `GET`  | `/search/nearby`      | Geo-nearby product search                                   |
| `POST` | `/upload`             | General file upload                                         |
| `POST` | `/cron/auction-close` | Cron: auto-activate/close auctions (requires `CRON_SECRET`) |

---

## Scripts Reference

| Script                 | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start Next.js development server       |
| `npm run build`        | Production build                       |
| `npm run start`        | Start production server                |
| `npm run lint`         | Run ESLint                             |
| `npm run db:migrate`   | Run Prisma migrations                  |
| `npm run db:generate`  | Generate Prisma client                 |
| `npm run db:seed`      | Seed database with sample data         |
| `npm run db:seed-auth` | Sync Supabase Auth with seed users     |
| `npm run db:studio`    | Open Prisma Studio (visual DB browser) |
| `npm run db:reset`     | Reset and re-seed database             |

---

## Database Schema

18 models and 19 enums covering the full marketplace domain:

| Domain            | Models                                             |
| ----------------- | -------------------------------------------------- |
| **Users & Auth**  | `User`, `UserCommodity`, `VerificationDocument`    |
| **Commodities**   | `Commodity`, `CommodityCategory`                   |
| **Products**      | `Product`, `ProductPhoto`                          |
| **Negotiations**  | `Auction`, `AuctionBid`, `Rfq`, `RfqQuote`         |
| **Orders**        | `Order`, `OrderTrackingEvent`, `EscrowTransaction` |
| **Communication** | `ChatThread`, `ChatMessage`, `Notification`        |
| **Reputation**    | `Review`                                           |

Key enums: `Role` (petani/pembeli/admin), `OrderStatus` (7 stages from negotiation to delivered), `AuctionStatus`, `RfqStatus`, `EscrowStatus`, `Unit` (kg/ikat/ekor), `Grade` (A/B/C).

---

## Design Decisions

- **No Row-Level Security (RLS)** — authorization is handled at the API layer using the Supabase service role key, keeping Prisma as the single data access layer.
- **Supabase Auth UID = Prisma User ID** — the auth user ID is explicitly set during registration, not auto-generated by Prisma.
- **Zod v4 strict UUID validation** — rejects non-v4 UUIDs; seed data uses hardcoded IDs that are pre-v4, so seed endpoints bypass Zod validation.
- **Prisma generator** uses `prisma-client-js` (not `prisma-client`) — Prisma enums are not exported from `@prisma/client`, so string literals are used in Zod schemas.
- **CSS custom properties for theming** — `.dark` class on `<html>` toggles all colors via `globals.css` variables, enabling instant theme switching without flash.

---

## Roadmap Todos

- [ ] Midtrans payment gateway integration (sandbox keys configured)
- [ ] Real-time chat with WebSocket (`ws` package already installed)
- [ ] Dispute resolution UI (API stubs exist)
- [ ] Transaction history pages
- [ ] Push notifications
- [ ] Product reviews and ratings UI
- [ ] Multi-languages support (English)
- [ ] Image optimization with Next.js `Image` component
- [ ] E2E and integration tests

---

## License

Distributed under the Apache 2.0 License. See LICENSE for more information.
