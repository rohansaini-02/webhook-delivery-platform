# 🚀 Webhook Delivery Platform

A professional-grade, resilient webhook ingestion and delivery system built with Node.js, RabbitMQ, and PostgreSQL. Features a real-time Admin Monitoring App built with Expo.

## 🌟 Key Features
*   **Reliable Delivery**: Decoupled ingestion using RabbitMQ for high throughput.
*   **Exponential Backoff**: Automated retry logic with configurable jitter.
*   **Dead Letter Queue (DLQ)**: Failed deliveries are captured for manual replay.
*   **HMAC Security**: All webhooks are signed with SHA-256 for consumer verification.
*   **Neon Dashboard**: Interactive mobile app for monitoring event flows and system health.

## 🏗 System Architecture
The platform follows a classic **Ingestion → Queue → Dispatcher** flow:
1. **API (Express)**: Ingests events and validates HMAC signatures.
2. **RabbitMQ**: Acts as a reliable buffer and retry manager.
3. **Worker (Node)**: Consumes messages and dispatches to subscriber endpoints.
4. **Database (Prisma/Postgres)**: Persists all history and delivery states.

## 🛠 Setup & Installation

### Backend (API)
```bash
cd api
cp .env.example .env  # Fill in your Database and RabbitMQ URLs
npm install
npx prisma migrate dev
npm run dev
```

### Admin App (Mobile)
```bash
cd admin-app
cp .env.example .env
npm install
npx expo start
```

## 📚 Documentation
Detailed guides are available in the [Project_Documentation](./Project_Documentation) folder:
*   [System Architecture](./Project_Documentation/02_Architecture.md)
*   [API Endpoint Overview](./Project_Documentation/03_API_Overview.md)
*   [Secure Ingestion & HMAC](./Project_Documentation/06_Ingestion_Security.md)
*   [Setup & Deployment Guide](./Project_Documentation/04_Setup_Guide.md)
*   [Troubleshooting Guide](./Project_Documentation/05_Troubleshooting.md)

## 🔍 Common Issues
*   **Database Timeouts**: Ensure your connection string includes `connect_timeout=60`.
*   **Network Errors**: Mobile apps must be on the same Wi-Fi as the API server. See the [Troubleshooting Guide](./Project_Documentation/05_Troubleshooting.md) for firewall and tunnel setup.

## 🤝 Contribution
This project was developed as a resilient, production-ready solution for webhook management. For major changes, please open an issue first to discuss what you would like to change.
