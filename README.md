# Zipdrive — Car Rental Platform

Zipdrive is a full-stack car rental application that lets hosts list vehicles for rent and guests search, book, and manage self-drive or intercity car rentals. It also includes an admin panel for platform management.

The project is split into two independent apps:

```
Zipdrive project/
├── car-rent-app-backend/    # Node.js / Express REST API
├── car-rent-app-frontend/   # React + TypeScript SPA
└── car-rent-backend-devsecops.zip   # Dockerfile, CI/CD pipeline & tests for the backend
```

## Features

- **Authentication** — JWT-based auth with email verification
- **Car listings** — hosts can add, edit, and manage cars, including makes, models, standards, features, and documents
- **Bookings** — self-drive and intercity booking flows, with OTP-based pickup/drop verification
- **Payments** — Razorpay integration
- **Notifications** — email (Nodemailer) and WhatsApp messaging
- **File storage** — AWS S3 for car photos and user/car documents
- **Admin panel** — dedicated admin routes and UI for platform oversight
- **Maps & routing** — Leaflet + Google Maps for location search and intercity routing
- **Scheduled jobs** — cron jobs for pickup/drop OTP handling

## Tech Stack

**Backend**
- Node.js, Express 5
- Sequelize ORM (MySQL primary; `pg`/`pg-hstore` also present)
- JWT auth, bcrypt/bcryptjs for password hashing
- Multer + AWS S3 (`@aws-sdk/client-s3`, `multer-s3`) for file uploads
- Razorpay for payments, Nodemailer for email, node-cron for scheduled jobs
- Joi for request validation, Helmet for security headers

**Frontend**
- React 19 + TypeScript, built with Vite
- React Router v7
- Bootstrap 5 + custom CSS modules
- Leaflet / React-Leaflet / Leaflet Routing Machine for maps
- Axios for API calls, jwt-decode for token handling
- React Hot Toast for notifications, FontAwesome / Lucide / React Icons

**DevOps** (`car-rent-backend-devsecops.zip`)
- Dockerfile + docker-compose for containerized backend
- GitHub Actions pipeline: install → test → `npm audit` → Docker build → SSH deploy to EC2 with PM2

## Architecture Notes

The backend follows a monolithic Express architecture on purpose (see `car-rent-app-backend/docs/ARCHITECTURE.md`), with ~16 Sequelize models covering users, cars, bookings, payments, and documents. The guiding principles are: no premature microservices, no over-optimization before profiling, incremental refactors, and clear module ownership — enforced through PR review and tests rather than heavier infrastructure (CQRS, event sourcing, etc.).

Backend layout:
```
car-rent-app-backend/
├── config/        # DB and app config
├── controller/     # Request handlers
├── routes/         # Express route definitions (mounted under /api)
├── models/         # Sequelize models
├── services/        # Business logic (booking, email, OTP, Razorpay)
├── middleware/      # Auth middleware
├── jobs/            # Cron jobs (pickup/drop OTP)
├── utils/           # Helpers (S3 upload, OTP, IST time, WhatsApp, etc.)
├── docs/            # Architecture notes
└── server.js         # App entry point
```

Frontend layout:
```
car-rent-app-frontend/src/
├── pages/       # Route-level views (Home, Cars, CarDetails, BookACar, MyCars,
│                #   MyDocuments, admin, auth, community, host/guest bookings,
│                #   intercity-car, searchedCars, support, verify-email)
├── components/   # Reusable UI (Navbar, AdminNavbar, Map, CarTabs, AddCarWizard, etc.)
├── routes/       # App-level route config
├── services/     # Axios API clients
├── types/        # TypeScript types
├── hooks/, utils/
```

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL (or PostgreSQL, given `pg` is included)
- AWS S3 bucket (for file uploads)
- Razorpay account (for payments)

### Backend Setup
```bash
cd car-rent-app-backend
npm install
```
Create a `.env` file in `car-rent-app-backend/` with:
```
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
DB_DIALECT=mysql

PORT=5000

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=

FRONTEND_URL=http://localhost:5173

AWS_S3_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

WHATSAPP_TOKEN=
PHONE_NUMBER_ID=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```
Run the server:
```bash
node server.js
# or, if nodemon is set up:
npx nodemon server.js
```
The API will be available at `http://localhost:5000/api`, and the DB schema syncs automatically on start via Sequelize.

### Frontend Setup
```bash
cd car-rent-app-frontend
npm install
npm run dev
```
The app runs on Vite's default dev server (`http://localhost:5173`).

### Docker (backend)
Unzip `car-rent-backend-devsecops.zip` for the Dockerfile and `docker-compose.yml`:
```bash
unzip car-rent-backend-devsecops.zip
cd car-rent-backend-devsecops
docker compose up --build
```

## API Overview

All routes are mounted under `/api`:

| Base path | Purpose |
|---|---|
| `/users` | User registration/auth |
| `/user-profile` | Profile management |
| `/cars` | Car listings |
| `/car-details`, `/car-features`, `/car-standards`, `/car-makes`, `/car-models` | Car metadata |
| `/bookings`, `/self-drive-bookings`, `/intercity-bookings` | Booking flows |
| `/booking-otp` | Pickup/drop OTP verification |
| `/user-document` | Document upload/verification |
| `/payments` | Razorpay payment handling |

## CI/CD

The included GitHub Actions workflow (in the devsecops package) runs on push/PR to `main`:
1. Install dependencies (`npm ci`)
2. Run tests (`npm test`)
3. Dependency vulnerability audit (`npm audit`)
4. Build the Docker image
5. On `main`, deploy to an EC2 instance over SSH and restart the process with PM2

## Notes

- `DB_HOST=localhost.txt` at the project root appears to be a real `.env` file with live-looking credentials — **do not commit this file**; rotate any exposed secrets and keep actual environment values out of version control.
- `SOFTWARE TESTING NOTES.docx` contains manual QA/testing notes for the project.
