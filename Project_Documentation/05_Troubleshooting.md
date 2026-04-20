# 🔍 Troubleshooting Guide

Common issues encountered during setup and how to resolve them.

## 1. Database Connection Timeouts
**Issue**: Backend logs show `PrismaClientInitializationError: Can't reach database server`.
**Cause**: High network latency (1000ms+) or firewall blocking port 5432.
**Solution**:
*   Ensure your `DATABASE_URL` contains `connect_timeout=60&pool_timeout=60`.
*   Verify your local IP is whitelisted in the Neon.tech dashboard (or use `0.0.0.0/0` for testing).

## 2. RabbitMQ Connection Reset
**Issue**: `ECONNRESET` in worker logs or RabbitMQ initialization fails.
**Cause**: CloudAMQP idle connection timeout or unstable Wi-Fi.
**Solution**:
*   The system now includes a 5-second auto-reconnect logic. 
*   If using local Docker, ensure port `5672` is mapped correctly: `-p 5672:5672`.

## 3. Mobile App "Network Error"
**Issue**: `[AxiosError: Network Error]` on the mobile device.
**Cause**: Phone cannot reach the backend server (laptop) over local Wi-Fi.
**Solution**:
*   Ensure both phone and laptop are on the **same Wi-Fi SSID** and frequency (e.g., both 2.4GHz).
*   Check Windows Defender Firewall; allow Node.js on Public/Private networks.
*   **Best fix**: Use a tunnel like `localtunnel` or `ngrok` and update `BACKEND_URL` in `.env`.

## 4. HMAC Verification Fails
**Issue**: Webhook destination receives the request but rejects the signature.
**Cause**: Mismatched secrets or malformed JSON stringification.
**Solution**:
*   Verify the secret in the active subscription matches exactly.
*   The payload signed is the **raw JSON string**. Ensure no extra whitespace exists in your consumer's body parser.
