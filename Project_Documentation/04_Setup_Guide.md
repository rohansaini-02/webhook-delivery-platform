# 🛠 Project Setup Guide

This guide describes how to set up the Webhook Delivery Platform from scratch.

## 1. Local Database (PostgreSQL)
Ensure you have access to a PostgreSQL instance.
1. Create a database named `webhookplatform`.
2. Update `api/.env` with your `DATABASE_URL`.
3. Run migrations: `npx prisma migrate dev`.

## 2. Messaging (RabbitMQ)
The platform requires RabbitMQ to be running.
*   **Option A (Local Docker)**: `docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
*   **Option B (Cloud)**: Use CloudAMQP and paste the `amqps://` URL into `RABBITMQ_URL`.

## 3. Launching the Backend
```bash
cd api
npm install
npm run dev
```
Verify the connection in logs: `[Database] ✅ Connected successfully`.

## 4. Launching the Mobile App
1. Install Expo Go on your physical device or started an emulator.
2. Run the start command:
```bash
cd admin-app
npm install
npx expo start
```
3. Scan the QR code or press `a` for Android / `i` for iOS.

## 🔑 Generating a Test Event
You can use the built-in script to verify your ingestion pipeline:
```bash
cd api
npm run seed:demo
```
This will create a subscriber, an event, and trigger a live delivery with HMAC signing.
