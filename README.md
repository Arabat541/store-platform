# TechStore - Retail CRM & E-commerce Platform

A full-stack retail CRM system + e-commerce website + PWA, built with Next.js 14, Prisma, MySQL, and TailwindCSS.

## Features

### Public Storefront
- Homepage with featured products
- Product catalog with category filtering & search
- Product detail pages
- Shopping cart
- Checkout with order placement
- Contact page
- PWA installable on mobile & desktop

### Admin CRM Dashboard (`/admin`)
- Analytics dashboard with stats, charts, and alerts
- Product management (CRUD, images, stock, categories)
- Order management with status workflow
- Customer management
- Inventory tracking with stock movements
- Supplier management
- Sales reports
- Settings

### Authentication
- JWT-based authentication
- bcrypt password hashing
- Role-based access control (admin, manager, seller)
- Protected admin routes

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MySQL via Prisma ORM
- **Auth:** JWT + bcrypt
- **State:** Zustand
- **PWA:** Service Worker + Web Manifest

## Getting Started

### Prerequisites
- Node.js 20.x
- MySQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

### Default Admin Credentials
- Email: `admin@techstore.com`
- Password: `admin123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Hostinger)

1. Build the project: `npm run build`
2. Configure Node.js app on Hostinger panel
3. Set environment variables in Hostinger
4. Point entry to `npm run start`
5. Set up MySQL database in Hostinger panel

## Project Structure

```
store-platform/
├── app/
│   ├── (store)/          # Public storefront pages
│   ├── admin/            # Admin CRM dashboard
│   ├── api/              # API routes
│   ├── login/            # Auth pages
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
├── database/             # Prisma schema & seed
├── lib/                  # Utilities, auth, stores
├── public/               # Static assets, PWA files
└── middleware.ts          # Route protection
```
