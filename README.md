# Webhook Delivery Platform

A reliable, secure, and observable webhook delivery engine that guarantees event delivery with retries, failure handling, and monitoring. This includes a robust backend delivery engine and a mobile admin application for monitoring and control.

## Overview

Modern applications generate critical events (user signups, payments, etc.) that must be delivered to external systems in real-time. This system provides a production-grade infrastructure component to manage these outgoing webhooks reliably.

### Key Features
- **Event Ingestion API**: Accepts predefined events
- **Subscription Management**: Register endpoints and select events
- **Reliable Delivery Engine**: Asynchronous engine using message queues (RabbitMQ)
- **Automatic Retries**: Exponential backoff for delivery failures
- **Timeout Handling**: Built-in protection against slow endpoints
- **Dead Letter Queue (DLQ)**: For permanently failed deliveries
- **Security**: HMAC-based payload signing (SHA-256)
- **Monitoring**: Centralized logs, success/failure status, and endpoint disabling logic
- **Admin Mobile App**: React Native app to monitor deliveries and control the system

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Message Queue**: RabbitMQ
- **Delivery Worker**: Node.js
- **Admin Mobile App**: React Native (Expo)

## Project Structure
- `api/`: Express REST APIs for Event Ingestion & Admin Operations
- `worker/`: Node.js consumer worker processes for event delivery
- `admin-app/`: React Native (Expo) mobile application

## Setup & Local Development

(Setup instructions to be added as components are initialized)
