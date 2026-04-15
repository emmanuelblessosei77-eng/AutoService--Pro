# AutoService Pro

A full-stack car service management platform built with React + TypeScript (frontend) and Node.js/Express (backend). It allows customers to book services, purchase auto parts, track their vehicles, and make payments via Paystack.

---

## Features

- Customer registration, login, and email verification
- Service booking with Paystack payment integration
- Auto parts shop with cart and checkout
- Customer portal (bookings, vehicles, order history)
- Mechanic portal (manage assigned jobs)
- Admin dashboard (manage services, parts, users, bookings)
- Light and dark mode support
- Email notifications (Gmail SMTP)

---

## How the App Works

### Customer Flow
1. **Register** — A customer creates an account and verifies their email.
2. **Browse Services** — View available car services (oil change, brake service, diagnostics, etc.) with pricing.
3. **Book a Service** — Select a service, choose a date/time, and pay via Paystack.
4. **Shop for Parts** — Browse the auto parts store, add items to cart, and checkout with Paystack.
5. **Customer Portal** — Track active bookings, view order history, manage registered vehicles, and request refunds.

### Mechanic Flow
1. Mechanics log in to their dedicated portal.
2. They see jobs assigned to them and can update the status (e.g. In Progress, Completed).

### Admin Flow
1. Admins log in to the admin dashboard.
2. They can manage services (add/edit/delete), manage car parts inventory, view all bookings, manage users, and process refunds.

### Payment Flow
- Payments are processed through **Paystack**.
- On successful payment, the booking or order is confirmed and a confirmation email is sent.
- Refund requests can be submitted through the customer portal and processed by the admin.

### Email Notifications
- Email verification on registration
- Booking confirmation
- Payment receipts
- Refund status updates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Payments | Paystack |
| Email | Nodemailer (Gmail SMTP) |
| Auth | JWT (JSON Web Tokens) |

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- A [Paystack](https://paystack.com/) account (for payment keys)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled

---

## Project Structure

```
AutoService-Pro/
├── src/                    # Frontend source code
│   ├── app/
│   │   ├── components/     # All React page and UI components
│   │   ├── contexts/       # ThemeContext, DashboardContext
│   │   ├── hooks/          # Custom React hooks
│   │   ├── images/         # Static images
│   │   └── utils/          # Helper utilities
│   └── services/
│       └── api.ts          # API service layer
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handler logic
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/      # Auth middleware
│   │   ├── db/             # Database connection
│   │   └── lib/            # Email queue, mailer
│   └── sql/
│       ├── schema.sql      # Database schema
│       └── sample_data.sql # Sample seed data
├── public/                 # Static public assets
├── .env.example            # Frontend environment variable template
└── backend/.env.example    # Backend environment variable template
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Del78/AutoService-Pro.git
cd AutoService-Pro
```

### 2. Set Up the Database

Open PostgreSQL and run:

```sql
CREATE DATABASE car_service_db;
```

Then apply the schema and sample data:

```bash
psql -U postgres -d car_service_db -f backend/sql/schema.sql
psql -U postgres -d car_service_db -f backend/sql/sample_data.sql
```

### 3. Configure Environment Variables

**Frontend** — copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

**Backend** — copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=4000

# PostgreSQL
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=your_database_password
PGDATABASE=car_service_db
PGPORT=5432

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# JWT
JWT_SECRET=your_strong_random_secret_here

# Gmail SMTP
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME=AutoService Pro
EMAIL_FROM=support@yourdomain.com
```

> **Note:** For `GMAIL_APP_PASSWORD`, do not use your regular Gmail password. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

### 4. Install Dependencies

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### 5. Run the Application

**Start the backend** (in one terminal):

```bash
cd backend
npm start
```

The API will be running at `http://localhost:4000`

**Start the frontend** (in another terminal):

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

---

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server |

---

## Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | Frontend | Backend API base URL |
| `VITE_PAYSTACK_PUBLIC_KEY` | Frontend | Paystack public key |
| `PORT` | Backend | Port the backend runs on |
| `PGHOST` | Backend | PostgreSQL host |
| `PGUSER` | Backend | PostgreSQL username |
| `PGPASSWORD` | Backend | PostgreSQL password |
| `PGDATABASE` | Backend | PostgreSQL database name |
| `PGPORT` | Backend | PostgreSQL port |
| `PAYSTACK_SECRET_KEY` | Backend | Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Backend | Paystack public key |
| `JWT_SECRET` | Backend | Secret key for JWT signing |
| `GMAIL_USER` | Backend | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Backend | Gmail App Password |
| `EMAIL_FROM_NAME` | Backend | Display name for sent emails |
| `EMAIL_FROM` | Backend | From address for sent emails |

---

## Default Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Express) | 4000 |
| PostgreSQL | 5432 |
