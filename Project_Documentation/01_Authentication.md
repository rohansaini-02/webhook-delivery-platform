# Authentication Architecture & Implementation

**Project:** Webhook Delivery Platform
**Module:** Security & Authentication
**Document Type:** Technical Reference

---

## 1. How the Authentication System Works

The Webhook Delivery Platform implements a robust, API-first authentication model. Unlike standard web applications that rely heavily on cookie-based sessions, this system is primarily designed for high-performance server-to-server and mobile-to-server communication. 

Authentication is governed by a **Global Middleware** (`requireAuth`). Whenever an incoming request targets a protected route (e.g., `/api/v1/subscriptions`, `/api/v1/deliveries`), the middleware intercepts the request. It looks for a specific HTTP header (`x-api-key`) and validates this key against the database. If the vital key is missing or incorrect, the request is immediately rejected with a `401 Unauthorized` error.

## 2. Authentication Method in Use

We are currently utilizing a **Deterministic API Key-Based Authentication** structure combined with **Bcrypt Secure Hashing**.

When an admin is created, the system securely generates a unique, highly randomized 64-character hexadecimal API Key (prefixed with `sk_live_`). This acts as the persistent token representing the user's permanent session and access rights.

## 3. Why We Chose This Method

When building a Webhook Delivery Engine, we deliberately chose API Keys over standard JWTs (JSON Web Tokens) or OAuth for the following reasons:

1. **Machine-to-Machine Preference:** Webhook platforms are developer tools. Developers prefer using static but highly secure API keys to integrate platforms together via SDKs, rather than dealing with the complexities of constantly refreshing JWT tokens.
2. **Deterministic Revocation:** Because the API Key is stored directly in the database (unlike statelessly signed JWTs), we can instantly revoke access or rotate a compromised key.
3. **Simplicity & Speed:** Extracting a header and validating it requires minimal computational overhead compared to constantly verifying asymmetric cryptographic signatures on every single API call.

## 4. Where and How User Data is Stored

### Backend (PostgreSQL & Prisma)
User data is stored strictly in the relational **PostgreSQL** database under the `Admin` table.
* **Stored fields:** `id`, `username`, `email`, `passwordHash`, `apiKey`, and timestamps.
* **Security measure:** The raw, plaintext password is **never** saved. It is hashed using the `bcrypt` algorithm with a work factor (salt rounds) of `10`. This means even if the database is theoretically compromised, the passwords remain mathematically impossible to reverse-engineer.

### Frontend (React Native / Expo)
On the mobile admin application, user data is persisted on the local device hardware using `@react-native-async-storage/async-storage`.
* **Stored fields:** We only store the `apiKey` and the locally displayed `username`. 
* **Security measure:** The app does not save your password. Next time the user opens the app, the AuthProvider reads the stored API Key from local storage and uses it to seamlessly authenticate all background Axios requests without requiring a manual login.

## 5. Complete Authentication Flow

### A. Registration Flow
1. **User Action:** Enters `email`, `username`, and `password` on the Mobile Registration Screen.
2. **Processing:** The frontend sends a POST request to `/api/v1/auth/register`.
3. **Backend Action:** Verifies the username isn't taken. Hashes the password using `bcrypt`. Generates a secure `sk_live_` API key using Node's native `crypto` library.
4. **Conclusion:** Saves the user to PostgreSQL and returns the API key back to the mobile app.

### B. Login Flow
1. **User Action:** Enters `username` and `password` on the Mobile Login Screen.
2. **Processing:** The frontend sends a POST request to `/api/v1/auth/login`.
3. **Backend Action:** Looks up the username in the database. Uses `bcrypt.compare()` to cross-check the submitted password against the stored `passwordHash`.
4. **Conclusion:** If they match, the backend returns the `apiKey`. The mobile app saves this key in device storage, updating the global React `AuthContext`, which instantly routes the user to the secure Dashboard.

### C. Authenticated Request Flow
1. **User Action:** User navigates to the "Subscriptions" tab.
2. **Processing:** Axios automatically intercepts the outgoing HTTP request and attaches the persistent `x-api-key: sk_live_...` header.
3. **Backend Action:** The `requireAuth` middleware extracts the header, queries the database to match the active key with the admin user, and allows the specific controller logic to execute. 
4. **Conclusion:** The frontend successfully receives and renders the private user data.
