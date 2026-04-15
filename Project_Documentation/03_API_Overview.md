# 📚 API Overview

This document provides a summary of the core API endpoints available in the system.

## 🔑 Authentication
All requests (except registration and login) require an API Key in the Authorization header.
`Authorization: Bearer <YOUR_API_KEY>`

## 👤 Auth Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Register a new admin account. |
| `/api/v1/auth/login` | `POST` | Exchange username/password for an API Key. |
| `/api/v1/auth/google` | `POST` | Exchange Google OAuth code for an API Key. |

## 📡 Events & Ingestion
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/events` | `POST` | Ingest a new event into the platform. |
| `/api/v1/events/meta/types` | `GET` | List all unique event types discovered in logs. |

## 🔔 Subscriptions
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/subscriptions` | `GET` | List active webhook subscriptions. |
| `/api/v1/subscriptions` | `POST` | Create a new webhook subscription. |
| `/api/v1/subscriptions/:id` | `PATCH` | Update or toggle a subscription. |

## 📊 Deliveries & DLQ
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/deliveries` | `GET` | List recent delivery attempts (Successful/Failed). |
| `/api/v1/deliveries/dlq` | `GET` | List deliveries in the Dead Letter Queue. |
| `/api/v1/deliveries/:id/replay` | `POST` | Re-trigger a failed delivery from the DLQ. |

## 📈 Monitoring
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | System health check (DB, Uptime). |
| `/api/v1/metrics` | `GET` | Fetch real-time system performance metrics. |
