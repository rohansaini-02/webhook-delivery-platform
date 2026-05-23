# Webhook Delivery Platform 🚀

A production-grade, resilient webhook ingestion and delivery engine that guarantees reliable event delivery with retries, failure handling, HMAC security, and a real-time mobile admin monitoring app.

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [Target Users](#target-users)
5. [Features](#features)
6. [Tech Stack](#tech-stack)
7. [System Architecture](#system-architecture)
8. [Project Structure](#project-structure)
9. [Installation & Local Setup](#installation--local-setup)
10. [Running the Application](#running-the-application)
11. [Future Enhancements](#future-enhancements)
12. [Contributors](#contributors)

## Overview

Modern applications generate critical events such as user signups, payments, and order failures that need to be reliably delivered to external systems in real time. However, direct event delivery often fails due to network issues, slow endpoints, or security risks. This platform solves that by providing a reliable, secure, and observable webhook delivery engine with automated retries, dead-letter queue handling, and a mobile admin app for monitoring and control.

## Problem Statement

Many systems rely on webhooks for real-time integrations (payments, notifications, analytics). Without a proper delivery engine, failed or delayed webhooks can lead to data inconsistency, poor user experience, and loss of trust. This system provides a production-grade infrastructure component that ensures reliability, security, and full visibility of event-driven communication.

## Goals & Objectives

- **Reliable Delivery**: Guarantee event ingestion and delivery with automated retries and exponential backoff.
- **Security First**: HMAC SHA-256 payload signing for consumer verification of every webhook.
- **Failure Handling**: Dead-letter queue (DLQ) for permanently failed deliveries and automatic disabling of faulty endpoints.
- **Full Observability**: Comprehensive delivery logs with success/failure status and retry counts.
- **Mobile Monitoring**: Real-time admin app for monitoring event flows and system health.

## Target Users

- **Developers & Startups**: Building event-driven systems that need reliable webhook delivery.
- **Product Teams**: Requiring real-time integrations with external services (payments, notifications, analytics).
- **DevOps Engineers**: Managing and monitoring webhook delivery pipelines.
- **Admins**: Monitoring system health, replaying failed events, and managing subscriptions.

## Features

- **Event Ingestion API**: Ingest predefined events (`user.created`, `payment.success`, `order.failed`).
- **Subscription Management**: Register endpoint URLs and select events to subscribe to.
- **Asynchronous Delivery**: Decoupled ingestion using RabbitMQ for high throughput.
- **Exponential Backoff**: Automated retry logic with configurable jitter.
- **Timeout Handling**: Graceful handling of slow or unresponsive endpoints.
- **Dead Letter Queue (DLQ)**: Capture permanently failed deliveries for manual replay.
- **Endpoint Auto-Disable**: Automatically disable faulty endpoints after repeated failures.
- **HMAC Security**: All webhooks signed with SHA-256 for payload verification.
- **Delivery Logs**: Full history with success/failure status and retry details.
- **Mobile Admin App**: Interactive React Native app for monitoring and control.

## Tech Stack

- **Backend API**: Node.js, Express.js
- **Delivery Worker**: Node.js
- **Message Queue**: RabbitMQ
- **Database**: PostgreSQL (via Prisma ORM)
- **Mobile App**: React Native (Expo)
- **Security**: HMAC SHA-256
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx

## System Architecture

The platform follows a classic **Ingestion → Queue → Dispatcher** flow:

```
Event Source → Event Ingestion API → PostgreSQL → RabbitMQ Queue → Delivery Worker → Webhook Endpoint
                                                                          ↓
                                                                   Retry (Exponential Backoff)
                                                                          ↓
                                                                   Dead Letter Queue (DLQ)

Mobile App → Admin APIs → View / Control Delivery Engine
```

1. **API (Express)**: Ingests events, validates HMAC signatures, and persists to PostgreSQL.
2. **RabbitMQ**: Acts as a reliable buffer and retry manager between ingestion and delivery.
3. **Worker (Node)**: Consumes messages from the queue and dispatches to subscriber endpoints.
4. **Database (Prisma/PostgreSQL)**: Persists all event history, subscriptions, and delivery states.

## Project Structure

```
webhook-delivery-platform/
├── api/                    # Express.js API server
│   ├── prisma/             # Database schema & migrations
│   ├── src/                # API source code
│   └── .env.example        # Environment variables template
├── worker/                 # Delivery worker service
│   ├── src/                # Worker source code
│   └── .env.example        # Environment variables template
├── admin-app/              # React Native (Expo) mobile app
│   ├── src/                # App source code
│   └── .env.example        # Environment variables template
├── Project_Documentation/  # Detailed project documentation
├── docker-compose.yml      # Docker orchestration
├── nginx.conf              # Reverse proxy configuration
└── README.md
```

## Installation & Local Setup

1. **Clone the repository**

```bash
git clone https://github.com/rohansaini-02/webhook-delivery-platform.git
cd webhook-delivery-platform
```

2. **Backend API Setup**

```bash
cd api
cp .env.example .env    # Fill in your Database and RabbitMQ URLs
npm install
npx prisma migrate dev
npm run dev
```

3. **Worker Setup**

```bash
cd worker
cp .env.example .env
npm install
npm run dev
```

4. **Admin App Setup (Mobile)**

```bash
cd admin-app
cp .env.example .env
npm install
npx expo start
```

## Running the Application

- **API (Backend)**: `http://localhost:3000`
- **RabbitMQ Management**: `http://localhost:15672`
- **Admin App**: Scan QR code from Expo CLI on your mobile device

> **Note**: Mobile app must be on the same Wi-Fi network as the API server.

## Future Enhancements

- **Manual Replay**: Replay failed webhook events from the DLQ via the admin app.
- **Performance Dashboard**: Delivery metrics and performance analytics.
- **Secret Rotation**: Rotate HMAC secrets via the mobile app.
- **Rate Limiting**: Per-subscription rate limiting for webhook delivery.
- **Alerting System**: Automated alerts for repeated delivery failures.

## Contributors

**Rohan Saini** — [GitHub](https://github.com/rohansaini-02)
