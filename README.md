# 🚀 Webhook Delivery Platform

A robust, enterprise-ready platform for ingesting, managing, and delivering webhooks with high reliability and observability.

## 🏗 Architecture Overview
The platform uses a decoupled producer-consumer architecture to ensure reliability even under high load:
1.  **Ingestion API**: Receives incoming events and secures them with HMAC signatures.
2.  **Message Queue (RabbitMQ)**: Stores events reliably to prevent data loss.
3.  **Dispatcher Worker**: Consumes events, performs deliveries with exponential backoff retries, and handles failures.
4.  **Admin UI**: A professional mobile dashboard for monitoring deliveries, managing Dead Letter Queues (DLQ), and configuring subscriptions.

## 🛠 Tech Stack
*   **Backend**: Node.js, Express, TypeScript
*   **Database**: PostgreSQL (Prisma ORM)
*   **Messaging**: RabbitMQ (CloudAMQP)
*   **Admin App**: React Native (Expo), TypeScript
*   **Styling**: Glassmorphic Neon Design System (Vanilla CSS/React Native Styles)

## 🚦 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Docker (Optional, for RabbitMQ)
*   PostgreSQL (or a Neon.tech account)

### 2. Backend Setup (`/api`)
```bash
cd api
npm install

# Copy .env.example to .env and fill in:
# DATABASE_URL, RABBITMQ_URL, API_KEY
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 3. Admin App Setup (`/admin-app`)
```bash
cd admin-app
npm install

# Build & Start Expo
npx expo start
```

## ✨ Key Features
*   **Dynamic Event Filtering**: Auto-discovers event types for precise log searching.
*   **Reliable Retries**: Custom exponential backoff strategy for failed endpoints.
*   **DLQ Management**: Integrated replay logic and manual failure investigation.
*   **Security**: HMAC-SHA256 signature verification for all dispatched payloads.
*   **Observability**: Real-time delivery logs and system metrics.

## 📁 Folder Structure
*   `api/src/controllers`: Business logic for auth, events, and deliveries.
*   `api/src/workers`: RabbitMQ consumer and delivery logic.
*   `admin-app/src/screens`: Dashboard, DLQ, and Subscription management.
*   `admin-app/src/components`: Reusable UI elements (FilterPicker, Badges).

---
*Developed for professional webhook management and reliability testing.*
