<p align="center">
  <img src="apps/web/public/logo.png" alt="SouqOne Logo" width="120" />
</p>

<h1 align="center">سوق وان — SouqOne</h1>

<p align="center">
  <strong>المنصة الأولى والوحيدة في سلطنة عمان لبيع وشراء وتأجير السيارات والمركبات والمعدات بكل ثقة وأمان</strong>
</p>

<p align="center">
  An All-in-One Vehicle & Equipment Marketplace Platform for the Sultanate of Oman
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Meilisearch-v1.12-FF5CAA?style=flat-square&logo=meilisearch&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-2-EF4444?style=flat-square&logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Private-blue?style=flat-square" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/v0.0.1-STABLE-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Currency-OMR%20🇴🇲-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/RTL-Arabic%20First-blueviolet?style=flat-square" />
</p>

---

## 🚀 About the Project

**SouqOne (سوق وان)** is a comprehensive, production-grade marketplace platform purpose-built for the Sultanate of Oman. It covers the complete lifecycle of vehicle commerce — from buying and selling cars, to renting vehicles with booking management, spare parts trading, driver recruitment, heavy equipment leasing, bus fleet operations, transport logistics, insurance, and more — all under one unified platform with real-time chat, instant notifications, and full-text Arabic search.

The platform is architected as a **Turborepo monorepo** with a **Next.js 15** server-rendered frontend and a **NestJS 10** REST + WebSocket API backend, backed by **PostgreSQL 16**, **Redis 7**, and **Meilisearch v1.12**. Every feature is designed with Arabic-first RTL UX, Omani market conventions (OMR currency, Omani governorates), and enterprise-level security including JWT authentication, Google OAuth, rate limiting, and strict DTO validation.

---

## 🧩 Features

### 🚗 Vehicle Marketplace
- **Sale listings** — Full vehicle specs (make, model, year, mileage, fuel, transmission, body, color, features)
- **Rental listings** — Daily/weekly/monthly pricing, deposit, km limits, driver option, delivery, insurance, cancellation policy
- **Booking system** — Date-range reservations with status workflow (Pending → Confirmed → Active → Completed/Cancelled)
- **Image gallery** — Multi-image upload via Cloudinary with ordering and primary selection

### 🔧 Spare Parts
- **11 categories** — Engine, Body, Electrical, Suspension, Brakes, Interior, Tires, Batteries, Oils, Accessories, Other
- **Compatibility filters** — Compatible makes, models, year range, OEM vs aftermarket
- **Condition tracking** — New, Used, Refurbished

### 👨‍✈️ Driver Jobs
- **Dual mode** — OFFERING (drivers seeking work) and HIRING (employers seeking drivers)
- **Employment types** — Full-time, Part-time, Temporary, Contract
- **License matching** — Light, Heavy, Transport, Bus, Motorcycle
- **Job applications** — Apply with message + resume, status tracking (Pending/Accepted/Rejected)

### 🛠️ Car Services
- **8 service types** — Maintenance, Cleaning, Modification, Inspection, Bodywork, Accessories Install, Keys & Locks, Towing
- **Provider types** — Workshop, Individual, Mobile, Company
- **Working hours** — Open/close times, working days, home service flag

### 🚚 Transport & Logistics
- **6 transport types** — Cargo, Furniture, Delivery, Heavy Transport, Truck Rental, Other
- **Pricing models** — Fixed, Per-KM, Per-Trip, Hourly, Negotiable
- **Tracking & insurance** — Optional flags for GPS tracking and goods insurance

### 🚌 Bus Marketplace
- **4 listing types** — Sale, Sale with Contract, Rent, Transport Requests
- **5 bus types** — Mini Bus, Medium Bus, Large Bus, Coaster, School Bus
- **Contract management** — Monthly rate, duration, expiry, client type (School, Company, Government, Tourism)

### ⚙️ Equipment Marketplace
- **15 equipment types** — Excavator, Crane, Loader, Bulldozer, Forklift, Concrete Mixer, Generator, Compressor, etc.
- **Equipment requests** — Post requirements, receive bids from suppliers
- **Bidding system** — Rate-limited (10/day), cooldown after withdrawal, accept/reject workflow
- **Operator listings** — Driver, Operator, Technician, Maintenance — with daily/hourly rates and certifications
- **State machine** — Request status transitions: OPEN → IN_PROGRESS/CANCELLED, IN_PROGRESS → CLOSED/CANCELLED

### 🗺️ Trips & Subscriptions
- **Trip types** — Bus Subscription, School Transport, Tourism, Corporate, Carpooling
- **Schedule types** — Daily, Weekly, Monthly, One-time
- **Route management** — From/to with stops, departure times, operating days, capacity tracking

### 🛡️ Insurance & Financing
- **5 offer types** — Comprehensive, Third-Party, Marine Insurance, Financing, Lease
- **Provider profiles** — Logo, coverage details, features list, terms URL

### 💬 Real-Time Chat
- **WebSocket gateway** — Socket.IO with Redis adapter for horizontal scaling
- **Generic conversations** — Entity-type polymorphic (Listing, Job, Part, Service, Transport, Trip, Insurance)
- **Rich messaging** — Text, Image, Audio, System messages
- **Message reactions** — Emoji reactions with unique constraint per user
- **Typing indicators** — Real-time typing status via WebSocket events

### 🔔 Notifications
- **13 notification types** — Messages, listings, bookings, jobs, price drops, system
- **Real-time delivery** — WebSocket push + persistent storage
- **Read tracking** — Mark as read with indexed queries

### 🔍 Full-Text Search
- **Meilisearch integration** — Arabic-optimized indexing with synonyms
- **Multi-entity search** — Cars, jobs, parts, services, transport, trips, insurance, buses, equipment
- **Standalone reindex** — CLI script for full re-indexing from database

### 🔐 Authentication & Security
- **JWT dual-token** — Access token (7d) + refresh token with revocation
- **Google OAuth** — One-tap sign-in via `google-auth-library`
- **Email verification** — Code-based with expiry
- **Password reset** — Secure code flow with Mailtrap/Nodemailer
- **Global rate limiting** — 60 requests/minute via `@nestjs/throttler`
- **Input validation** — `class-validator` DTOs with whitelist + forbidNonWhitelisted
- **CORS** — Enabled with credentials

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client["🖥️ Frontend — Next.js 15"]
        A[React 19 + TailwindCSS 4]
        B[React Query v5]
        C[Socket.IO Client]
        D[Leaflet Maps]
    end

    subgraph API["⚙️ Backend — NestJS 10"]
        E[REST Controllers]
        F[WebSocket Gateway]
        G[Passport JWT Guards]
        H[ValidationPipe + DTOs]
        I[Throttler Guard]
    end

    subgraph Data["🗄️ Data Layer"]
        J[(PostgreSQL 16)]
        K[(Redis 7)]
        L[(Meilisearch v1.12)]
        M[☁️ Cloudinary]
    end

    A -->|HTTP / SSR| E
    B -->|REST API| E
    C -->|WebSocket| F
    E -->|Prisma ORM| J
    F -->|Pub/Sub Adapter| K
    E -->|Cache & Sessions| K
    E -->|Full-Text Search| L
    E -->|Image Upload| M
    G -.->|Auth Guard| E
    H -.->|Validation| E
    I -.->|Rate Limit| E

    style Client fill:#0a0a0a,stroke:#3b82f6,color:#fff
    style API fill:#0a0a0a,stroke:#e0234e,color:#fff
    style Data fill:#0a0a0a,stroke:#10b981,color:#fff
```

---

## 🧱 Backend Module Map

```mermaid
graph LR
    subgraph Core["🔧 Core"]
        PRISMA[PrismaModule]
        REDIS[RedisModule]
        CLOUD[CloudinaryModule]
        MAIL[MailModule]
    end

    subgraph Auth["🔐 Auth"]
        AUTH[AuthModule]
        USERS[UsersModule]
    end

    subgraph Marketplace["🏪 Marketplace"]
        LISTINGS[ListingsModule]
        CARS[CarsModule]
        PARTS[PartsModule]
        SERVICES[ServicesModule]
        JOBS[JobsModule]
        TRANSPORT[TransportModule]
        TRIPS[TripsModule]
        INSURANCE[InsuranceModule]
        BUSES[BusesModule]
        EQUIP[EquipmentModule]
    end

    subgraph Engagement["💬 Engagement"]
        CHAT[ChatModule]
        FAVORITES[FavoritesModule]
        NOTIF[NotificationsModule]
    end

    subgraph Platform["🔍 Platform"]
        SEARCH[SearchModule]
        UPLOADS[UploadsModule]
        BOOKINGS[BookingsModule]
    end

    AUTH --> PRISMA
    AUTH --> REDIS
    AUTH --> MAIL
    LISTINGS --> PRISMA
    LISTINGS --> UPLOADS
    CHAT --> REDIS
    SEARCH --> PRISMA
    EQUIP --> PRISMA
    UPLOADS --> CLOUD

    style Core fill:#1a1a2e,stroke:#e94560,color:#fff
    style Auth fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style Marketplace fill:#1a1a2e,stroke:#3b82f6,color:#fff
    style Engagement fill:#1a1a2e,stroke:#10b981,color:#fff
    style Platform fill:#1a1a2e,stroke:#8b5cf6,color:#fff
```

### Equipment Module — Internal Services

```mermaid
graph TD
    EC[EquipmentController] --> ELS[EquipmentListingsService]
    ERC[EquipmentRequestsController] --> ERS[EquipmentRequestsService]
    ERC --> EBS[EquipmentBidsService]
    OC[OperatorsController] --> OS[OperatorsService]

    ELS -->|CRUD + Images + Slug| DB[(Prisma)]
    ERS -->|CRUD + State Machine| DB
    EBS -->|Rate Limit + Cooldown| DB
    OS -->|CRUD + Search| DB

    style EC fill:#1e293b,stroke:#f59e0b,color:#fff
    style ERC fill:#1e293b,stroke:#3b82f6,color:#fff
    style OC fill:#1e293b,stroke:#10b981,color:#fff
```

---

## 🗃️ Database Schema (ER Diagram)

```mermaid
erDiagram
    User ||--o{ Listing : "sells"
    User ||--o{ Booking : "rents"
    User ||--o{ Favorite : "favorites"
    User ||--o{ Conversation : "participates"
    User ||--o{ Notification : "receives"
    User ||--o{ DriverJob : "posts"
    User ||--o{ JobApplication : "applies"
    User ||--o{ SparePart : "sells"
    User ||--o{ CarService : "provides"
    User ||--o{ TransportService : "provides"
    User ||--o{ TripService : "provides"
    User ||--o{ InsuranceOffer : "provides"
    User ||--o{ BusListing : "lists"
    User ||--o{ EquipmentListing : "lists"
    User ||--o{ EquipmentRequest : "requests"
    User ||--o{ EquipmentBid : "bids"
    User ||--o{ OperatorListing : "offers"
    User ||--o{ RefreshToken : "authenticates"

    Listing ||--o{ ListingImage : "has"
    Listing ||--o{ Booking : "booked"
    Listing ||--o{ Favorite : "favorited"
    Listing ||--o{ Conversation : "discussed"

    Conversation ||--o{ Message : "contains"
    Conversation ||--o{ ConversationParticipant : "includes"
    Message ||--o{ MessageReaction : "reacted"

    DriverJob ||--o{ JobApplication : "receives"

    EquipmentRequest ||--o{ EquipmentBid : "receives"

    Brand ||--o{ CarModel : "has"
    CarModel ||--o{ CarYear : "spans"

    BusListing ||--o{ BusListingImage : "has"
    EquipmentListing ||--o{ EquipmentListingImage : "has"
    SparePart ||--o{ SparePartImage : "has"
    CarService ||--o{ CarServiceImage : "has"
    TransportService ||--o{ TransportImage : "has"
```

### Key Models Summary

| Model | Records | Key Fields |
|-------|---------|------------|
| `User` | Central entity | email, username, role, googleId, governorate |
| `Listing` | Vehicle ads | make, model, year, price, listingType (SALE/RENTAL) |
| `Booking` | Rental reservations | startDate, endDate, totalPrice, status workflow |
| `DriverJob` | Job posts | jobType (OFFERING/HIRING), salary, licenseTypes |
| `SparePart` | Parts for sale | partCategory, condition, compatibleMakes |
| `CarService` | Service providers | serviceType, providerType, workingHours |
| `TransportService` | Logistics | transportType, pricingType, coverageAreas |
| `TripService` | Subscriptions | tripType, scheduleType, routeFrom/To |
| `InsuranceOffer` | Insurance/finance | offerType, providerName, features |
| `BusListing` | Bus marketplace | busListingType, busType, contractType |
| `EquipmentListing` | Equipment ads | equipmentType, listingType (SALE/RENT) |
| `EquipmentRequest` | Equipment needs | requestStatus state machine, bids |
| `EquipmentBid` | Bid on requests | price, bidStatus, rate-limited |
| `OperatorListing` | Operator profiles | operatorType, certifications, rates |
| `Conversation` | Polymorphic chat | entityType, entityId |
| `Notification` | 13 types | type, title, body, isRead |

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.x | SSR, App Router, RSC |
| | React | 19.x | UI framework |
| | TailwindCSS | 4.x | Utility-first CSS |
| | React Query | 5.x | Server state management |
| | Socket.IO Client | 4.x | Real-time WebSocket |
| | Leaflet | 1.9 | Interactive maps |
| | Lucide React | 1.7 | Icon library |
| | next-themes | 0.4 | Dark mode support |
| **Backend** | NestJS | 10.x | Modular REST + WS framework |
| | Prisma | 6.x | Type-safe ORM |
| | Passport JWT | 4.x | Authentication strategy |
| | class-validator | 0.14 | DTO validation |
| | class-transformer | 0.5 | DTO transformation |
| | Socket.IO | 4.7 | WebSocket server |
| | @nestjs/throttler | 6.x | Rate limiting |
| **Database** | PostgreSQL | 16 | Primary relational DB |
| **Cache** | Redis | 7 (Alpine) | Caching, Socket.IO pub/sub |
| | ioredis | 5.4 | Redis client |
| | @socket.io/redis-adapter | 8.3 | Horizontal scaling |
| **Search** | Meilisearch | v1.12 | Full-text Arabic search |
| **Storage** | Cloudinary | 2.5 | Image CDN & optimization |
| **Email** | Mailtrap | 3.4 | Transactional email |
| | Nodemailer | 6.9 | SMTP fallback |
| **Auth** | google-auth-library | 10.6 | Google OAuth |
| | jsonwebtoken | 9.0 | JWT signing |
| | bcryptjs | 2.4 | Password hashing |
| **Monorepo** | Turborepo | 2.4 | Build orchestration |
| | npm workspaces | — | Package management |
| **Testing** | Jest | 29.x | Unit tests |
| | Supertest | 7.x | E2E API tests |
| | Playwright | 1.59 | Browser E2E tests |
| **DevOps** | Docker Compose | — | Local infrastructure |

---

## 📁 Project Structure

```
souqone/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Database schema (1339 lines, 30+ models)
│   │   └── src/
│   │       ├── main.ts               # Bootstrap, CORS, ValidationPipe, Redis IO Adapter
│   │       ├── app.module.ts          # Root module — 18 feature modules
│   │       ├── auth/                  # JWT + Google OAuth + email verification
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── jwt.strategy.ts
│   │       │   └── dto/              # LoginDto, RegisterDto, ResetPasswordDto...
│   │       ├── users/                 # User CRUD + profiles
│   │       ├── listings/              # Vehicle sale & rental listings
│   │       ├── cars/                  # Brand/Model/Year reference data
│   │       ├── bookings/              # Rental booking workflow
│   │       ├── jobs/                  # Driver jobs + applications
│   │       ├── parts/                 # Spare parts marketplace
│   │       ├── services/              # Car service providers
│   │       ├── transport/             # Transport & logistics
│   │       ├── trips/                 # Trips & subscriptions
│   │       ├── insurance/             # Insurance & financing
│   │       ├── buses/                 # Bus marketplace
│   │       ├── equipment/             # Equipment marketplace (4 services)
│   │       │   ├── equipment-listings.service.ts
│   │       │   ├── equipment-requests.service.ts
│   │       │   ├── equipment-bids.service.ts
│   │       │   ├── operators.service.ts
│   │       │   ├── equipment.controller.ts
│   │       │   ├── equipment-requests.controller.ts
│   │       │   ├── operators.controller.ts
│   │       │   └── dto/              # Create + Update + Query DTOs
│   │       ├── chat/                  # Real-time messaging
│   │       │   ├── chat.controller.ts
│   │       │   ├── chat.gateway.ts   # Socket.IO gateway
│   │       │   └── chat.service.ts
│   │       ├── favorites/             # Polymorphic favorites
│   │       ├── notifications/         # Push + persistent notifications
│   │       ├── uploads/               # Cloudinary image uploads
│   │       ├── search/                # Meilisearch integration
│   │       │   ├── search.service.ts  # Multi-entity indexing
│   │       │   ├── synonyms.ts        # Arabic search synonyms
│   │       │   └── reindex.standalone.ts
│   │       ├── prisma/                # PrismaModule + PrismaService
│   │       ├── redis/                 # RedisModule + RedisService
│   │       ├── cloudinary/            # CloudinaryModule
│   │       ├── mail/                  # MailModule (Mailtrap + Nodemailer)
│   │       └── common/
│   │           ├── adapters/          # RedisIoAdapter (Socket.IO scaling)
│   │           ├── decorators/        # @CurrentUser, custom decorators
│   │           ├── dto/               # PaginationDto
│   │           ├── filters/           # GlobalExceptionFilter
│   │           └── guards/            # JwtAuthGuard
│   │
│   └── web/                           # Next.js Frontend
│       └── src/
│           ├── app/                   # App Router pages (30+ routes)
│           │   ├── page.tsx           # Homepage
│           │   ├── listings/          # Vehicle listings
│           │   ├── jobs/              # Driver jobs
│           │   ├── parts/             # Spare parts
│           │   ├── services/          # Car services
│           │   ├── transport/         # Transport
│           │   ├── trips/             # Trips
│           │   ├── insurance/         # Insurance
│           │   ├── buses/             # Buses
│           │   ├── equipment/         # Equipment
│           │   ├── messages/          # Chat interface
│           │   ├── bookings/          # Booking management
│           │   ├── favorites/         # Saved items
│           │   ├── notifications/     # Notification center
│           │   ├── my-listings/       # User's listings dashboard
│           │   ├── profile/           # User profile
│           │   ├── login/             # Authentication
│           │   ├── register/          # Registration
│           │   ├── add-listing/       # Multi-category listing creation
│           │   └── globals.css        # Design tokens + custom classes
│           ├── components/
│           │   ├── layout/            # Navbar, Footer, Sidebar, MobileNav
│           │   ├── ui/                # Button, Badge, SearchBar, etc.
│           │   ├── map/               # Leaflet map components
│           │   └── ...               # AuthGuard, Toast, Skeleton, etc.
│           ├── features/
│           │   ├── ads/               # Vehicle card components
│           │   ├── chat/              # Chat UI components
│           │   ├── home/              # Homepage sections
│           │   ├── jobs/              # Job card components
│           │   └── rentals/           # Rental card components
│           ├── hooks/                 # Custom React hooks
│           ├── lib/
│           │   ├── api/               # 18 API hook files (React Query)
│           │   ├── auth.ts            # Auth context + token management
│           │   ├── socket.ts          # Socket.IO client setup
│           │   ├── constants/         # Labels, mappings, options
│           │   ├── location-data.ts   # Omani governorates & cities
│           │   └── ...               # Utils (time, image, geo, errors)
│           └── providers/             # QueryProvider, ThemeProvider, etc.
│
├── packages/
│   ├── types/                         # Shared TypeScript types
│   ├── ui/                            # Shared UI components
│   └── config/                        # Shared config (ESLint, TS)
│
├── docker-compose.yml                 # PostgreSQL 16 + Redis 7 + Meilisearch v1.12
├── turbo.json                         # Turborepo pipeline config
├── package.json                       # Root workspace config
└── .env.example                       # Environment template
```

---

## 🔐 Authentication & Security

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Client                    API                    Database      │
│     │                        │                        │          │
│     │── POST /auth/login ───►│                        │          │
│     │                        │── Verify credentials ─►│          │
│     │                        │◄── User record ────────│          │
│     │                        │── Sign JWT tokens      │          │
│     │◄── { accessToken,      │── Store refresh ──────►│          │
│     │     refreshToken }     │                        │          │
│     │                        │                        │          │
│     │── GET /api/* ─────────►│                        │          │
│     │   Authorization:       │── JwtStrategy          │          │
│     │   Bearer <token>       │── Validate + decode    │          │
│     │                        │── @CurrentUser()       │          │
│     │◄── Protected response  │                        │          │
│     │                        │                        │          │
│     │── POST /auth/refresh ─►│                        │          │
│     │   { refreshToken }     │── Verify + rotate ────►│          │
│     │◄── { new tokens }      │◄── New refresh ────────│          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Security Layer | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs` with salt rounds |
| **JWT Access Token** | 7-day expiry, signed with `JWT_SECRET` |
| **Refresh Tokens** | Stored in DB, revocable, rotated on use |
| **Google OAuth** | `google-auth-library` ID token verification |
| **Email Verification** | 6-digit code with expiry timestamp |
| **Password Reset** | Secure code via email with expiry |
| **Global Rate Limiting** | 60 requests/minute per IP (`@nestjs/throttler`) |
| **Input Validation** | `class-validator` decorators on all DTOs |
| **Whitelist Mode** | `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` |
| **CORS** | Enabled with credentials for cross-origin requests |
| **Bid Rate Limiting** | 10 bids/day per user + 1-hour cooldown after withdrawal |
| **Image Upload Limit** | Max 10 images per equipment listing |
| **Status State Machine** | Enforced transitions for equipment request status |

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login with email/password |
| `POST` | `/google` | Google OAuth sign-in |
| `POST` | `/refresh` | Refresh access token |
| `POST` | `/logout` | Revoke refresh token |
| `POST` | `/verify-email` | Verify email with code |
| `POST` | `/forgot-password` | Request password reset |
| `POST` | `/reset-password` | Reset password with code |

### Listings (`/api/listings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List vehicles (paginated, filterable) |
| `GET` | `/:id` | Get listing details |
| `POST` | `/` | Create listing (auth) |
| `PATCH` | `/:id` | Update listing (owner) |
| `DELETE` | `/:id` | Delete listing (owner) |

### Cars (`/api/cars`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/brands` | List all car brands |
| `GET` | `/brands/:id/models` | Models for a brand |
| `GET` | `/models/:id/years` | Years for a model |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | User's bookings |
| `POST` | `/` | Create booking request |
| `PATCH` | `/:id/status` | Update booking status |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List driver jobs |
| `GET` | `/:id` | Job details |
| `POST` | `/` | Create job post (auth) |
| `PATCH` | `/:id` | Update job (owner) |
| `DELETE` | `/:id` | Delete job (owner) |
| `POST` | `/:id/apply` | Apply to job |
| `GET` | `/:id/applications` | List applications (owner) |

### Parts (`/api/parts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List spare parts |
| `GET` | `/:id` | Part details |
| `POST` | `/` | Create part listing |
| `PATCH` | `/:id` | Update part |
| `DELETE` | `/:id` | Delete part |

### Services (`/api/services`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List car services |
| `GET` | `/:id` | Service details |
| `POST` | `/` | Create service |
| `PATCH` | `/:id` | Update service |
| `DELETE` | `/:id` | Delete service |

### Transport (`/api/transport`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List transport services |
| `GET` | `/:id` | Transport details |
| `POST` | `/` | Create transport listing |
| `PATCH` | `/:id` | Update transport |
| `DELETE` | `/:id` | Delete transport |

### Trips (`/api/trips`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List trips |
| `GET` | `/:id` | Trip details |
| `POST` | `/` | Create trip |
| `PATCH` | `/:id` | Update trip |
| `DELETE` | `/:id` | Delete trip |

### Insurance (`/api/insurance`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List insurance offers |
| `GET` | `/:id` | Offer details |
| `POST` | `/` | Create offer |
| `PATCH` | `/:id` | Update offer |
| `DELETE` | `/:id` | Delete offer |

### Buses (`/api/buses`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List bus listings |
| `GET` | `/:id` | Bus details |
| `POST` | `/` | Create bus listing |
| `PATCH` | `/:id` | Update bus |
| `DELETE` | `/:id` | Delete bus |

### Equipment (`/api/equipment`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List equipment |
| `GET` | `/:id` | Equipment details |
| `POST` | `/` | Create equipment listing |
| `PATCH` | `/:id` | Update equipment |
| `DELETE` | `/:id` | Delete equipment |

### Equipment Requests (`/api/equipment-requests`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List requests |
| `GET` | `/:id` | Request details |
| `POST` | `/` | Create request |
| `PATCH` | `/:id` | Update request |
| `PATCH` | `/:id/status` | Change request status (state machine) |
| `DELETE` | `/:id` | Delete request |
| `POST` | `/:id/bids` | Submit bid (rate-limited) |
| `PATCH` | `/bids/:bidId/accept` | Accept bid |
| `PATCH` | `/bids/:bidId/reject` | Reject bid |

### Operators (`/api/operators`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List operator profiles |
| `GET` | `/:id` | Operator details |
| `POST` | `/` | Create operator listing |
| `PATCH` | `/:id` | Update operator |
| `DELETE` | `/:id` | Delete operator |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/conversations` | User's conversations |
| `GET` | `/conversations/:id` | Conversation messages |
| `POST` | `/conversations` | Start conversation |
| **WS** | `message` | Send message (Socket.IO) |
| **WS** | `typing` | Typing indicator |
| **WS** | `reaction` | Message reaction |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/DELETE` | `/api/favorites/*` | Manage favorites |
| `GET/PATCH` | `/api/notifications/*` | Notifications |
| `POST` | `/api/uploads/*` | Image uploads |
| `GET` | `/api/search?q=...` | Global full-text search |

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Docker** & **Docker Compose** (for PostgreSQL, Redis, Meilisearch)
- **npm** ≥ 10.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mahmoud997s/SouqOne.git
cd SouqOne

# 2. Install dependencies (workspaces auto-resolved)
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (DB, JWT secrets, API keys...)

# 4. Start infrastructure services
docker compose up -d
# Starts: PostgreSQL (port 5400), Redis (port 6379), Meilisearch (port 7700)

# 5. Generate Prisma client
npm run db:generate

# 6. Push database schema
npm run db:push

# 7. Seed reference data (optional)
cd apps/api
npm run seed:cars          # Import car brands/models/years
npm run seed:marketplace   # Seed marketplace sample data
cd ../..

# 8. Start development servers
npm run dev
# ✅ API  → http://localhost:4000/api
# ✅ Web  → http://localhost:3000
```

### Docker Services

```yaml
services:
  db:        PostgreSQL 16  → localhost:5400
  redis:     Redis 7 Alpine → localhost:6379
  meilisearch: Meilisearch v1.12 → localhost:7700
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5400/carOne` |
| `API_PORT` | Backend server port | `4000` |
| `API_URL` | Backend base URL | `http://localhost:4000` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_EXPIRATION` | Access token TTL | `7d` |
| `REDIS_HOST` | Redis host | `127.0.0.1` |
| `REDIS_PORT` | Redis port | `6379` |
| `MEILI_HOST` | Meilisearch URL | `http://localhost:7700` |
| `MEILI_API_KEY` | Meilisearch master key | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `NODE_ENV` | Environment | `development` |

---

## 📜 Scripts Reference

### Root (Turborepo)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |

### API (`apps/api`)

| Script | Description |
|--------|-------------|
| `npm run dev` | NestJS watch mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run import:cars` | Import car reference data |
| `npm run seed:marketplace` | Seed sample marketplace data |

### Web (`apps/web`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |

---

## 🚀 Deployment

The platform is currently deployed on **Railway** with the following architecture:

```
┌──────────────────────────────────────────────────┐
│                   Railway Cloud                   │
├──────────────────────────────────────────────────┤
│                                                   │
│   ┌─────────────┐    ┌─────────────────────────┐ │
│   │  Next.js 15  │    │      NestJS API         │ │
│   │  (Frontend)  │───►│  caroneweb-production   │ │
│   │   Port 3000  │    │       Port 4000         │ │
│   └─────────────┘    └───────────┬─────────────┘ │
│                                   │               │
│                    ┌──────────────┼──────────┐    │
│                    ▼              ▼          ▼    │
│              ┌──────────┐  ┌─────────┐ ┌────────┐│
│              │PostgreSQL│  │  Redis  │ │ Meili  ││
│              │    16    │  │    7    │ │ Search ││
│              └──────────┘  └─────────┘ └────────┘│
│                                                   │
│   ┌─────────────────────────────────────────────┐ │
│   │           Cloudinary CDN (Images)           │ │
│   └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is **privately licensed**. All rights reserved.

---

<p align="center">
  <img src="apps/web/public/logo.png" alt="SouqOne" width="40" />
  <br />
  <strong>سوق وان — SouqOne</strong>
  <br />
  <sub>Built with ❤️ in the Sultanate of Oman 🇴🇲</sub>
</p>
