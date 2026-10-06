# Salgirah Mubarak — Wish Generator

A commemorative wish card generator for the Salgirah (birthday) of Mawlana Hazir Imam,
Prince Rahim Aga Khan V, celebrated on 12th October by the Ismaili Jamat.

Visitors enter their name and a personal wish, preview a gold-and-emerald keepsake card,
download it as a PNG image, and their wish is saved to MongoDB. Admins can sign in to
`/admin` to view all submitted wishes.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** for styling
- **MongoDB** + **Mongoose** for storage
- **html-to-image** for client-side PNG export of the wish card
- Password-protected `/admin` page (HTTP-only signed session cookie)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Connection string for your MongoDB database (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster) |
| `ADMIN_PASSWORD` | Password required to sign in to `/admin` |
| `ADMIN_SESSION_SECRET` | Long random string used to sign the admin session cookie (e.g. `openssl rand -hex 32`) |

### 3. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public wish form, and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### 4. Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/
    page.tsx                 Public wish form + card preview + download
    admin/page.tsx            Admin login + submitted wishes table
    api/wishes/route.ts       POST (save wish) / GET (admin-only list)
    api/admin/login/route.ts  Admin login, sets session cookie
    api/admin/logout/route.ts Admin logout, clears session cookie
  components/
    WishCard.tsx               The downloadable card template
    ResponsiveCardPreview.tsx  Scales the card to fit any screen for preview
    WishStudio.tsx             Form state, save + PNG download logic
  lib/
    mongodb.ts                 Cached Mongoose connection
    adminAuth.ts                Session token creation/verification
  models/Wish.ts               Mongoose schema for saved wishes
  types/wish.ts                Shared types and field length limits
```

## Deployment

Recommended: deploy the app to [Vercel](https://vercel.com) and use
[MongoDB Atlas](https://www.mongodb.com/atlas) for the database. Set the same three
environment variables (`MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) in your
hosting provider's project settings.
