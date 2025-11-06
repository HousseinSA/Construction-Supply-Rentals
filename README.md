# 🏗️ Construction Equipment Rental Platform

> Multilingual platform connecting construction equipment suppliers with renters across Mauritania.

## ✨ Features

### 🌍 Multilingual Support

- **3 Languages**: Arabic (RTL), French, English
- Seamless language switching
- Fully localized content and UI

### 👥 Multi-Role System

- **Admin**: Full platform management and oversight
- **Supplier**: List and manage equipment inventory
- **Renter**: Browse and rent construction equipment

### 🔐 Authentication & Security

- NextAuth.js integration
- Login with email or phone number
- Role-based access control
- Secure JWT sessions (30 days)
- Password and phone validation

### 📱 User Experience

- Mobile-first responsive design
- Optimized for all screen sizes
- Smooth animations and transitions
- Toast notifications
- Loading states

### 🔍 Search & Discovery

- Filter equipment by city
- Browse by equipment categories
- Search by equipment type
- Real-time availability status

### 🏷️ Equipment Categories

- **Excavation** (Terrassement)
- **Leveling & Compaction** (Nivellement et Compactage)
- **Transport**
- **Lifting & Handling** (Levage et Manutention)

## 🚀 Tech Stack

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| **Next.js 15**   | React framework with App Router |
| **TypeScript**   | Type-safe development           |
| **MongoDB**      | NoSQL database                  |
| **NextAuth.js**  | Authentication solution         |
| **Tailwind CSS** | Utility-first styling           |
| **next-intl**    | Internationalization            |
| **Zustand**      | State management                |
| **Lucide React** | Icon library                    |

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

**Environment Variables:**

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 👤 User Roles & Dashboards

### 🔴 Admin Dashboard

- ➕ Create new equipment
- 📋 Manage all equipment listings
- 👥 Manage users (suppliers & renters)
- 📅 Handle booking requests
- 📊 View platform analytics
- ⚙️ Configure platform settings

### 🟢 Supplier Dashboard

- ➕ Add equipment to platform
- 📦 Manage equipment inventory
- 📅 Track rental bookings
- 👤 Update business profile
- 💰 View earnings

### 🔵 Renter Dashboard

- 🔍 Browse available equipment
- 📅 View current and past bookings
- 📝 Submit rental requests
- 👤 Manage account settings
- ⭐ Rate equipment (coming soon)

## 🏙️ Supported Cities

Nouakchott • Nouadhibou • Rosso • Kaédi • Zouérat • Kiffa • Atar • Sélibaby • Akjoujt • Tidjikja

## 🔑 Admin Access

```
Email: admin@gmail.com
Phone: 22345678
Password: 12345678
```

## 🗂️ Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized routes
│   │   ├── auth/          # Login, register, reset password
│   │   ├── dashboard/     # Role-based dashboards
│   │   ├── equipment/     # Equipment browsing & details
│   │   └── categories/    # Category pages
│   └── api/               # API routes
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── equipment/         # Equipment cards & grids
│   ├── landing/           # Landing page sections
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
│   ├── models/            # MongoDB models
│   └── auth.ts            # NextAuth configuration
├── stores/                # Zustand state stores
└── i18n/                  # Internationalization setup
```

## 📱 Key Pages

| Page                 | Route                         | Description                  |
| -------------------- | ----------------------------- | ---------------------------- |
| **Home**             | `/`                           | Landing page with categories |
| **Login**            | `/auth/login`                 | User authentication          |
| **Register**         | `/auth/register`              | Account creation             |
| **Equipment**        | `/equipment`                  | Browse all equipment         |
| **Category**         | `/categories/[slug]`          | Equipment by category        |
| **Dashboard**        | `/dashboard`                  | Role-based dashboard         |
| **Create Equipment** | `/dashboard/equipment/create` | Add new equipment            |

## 📜 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
node scripts/setup-admin.js  # Setup admin user
```

## 🔒 Security Features

- ✅ Secure password storage (plain text for demo)
- ✅ Phone number validation (Mauritanian format: 2/3/4 + 7 digits)
- ✅ Email validation
- ✅ Protected routes with middleware
- ✅ Session-based authentication
- ✅ CSRF protection

## 📞 Support

For support and inquiries, please contact the development team.

---

**Built with ❤️ for Mauritanian construction industry**
