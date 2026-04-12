# 📡 Secure Ingestion Pipeline

The platform ensures all incoming and outgoing webhooks are authenticated and verified to prevent spoofing and tampering.

## 📥 Incoming Ingestion
1. **API Key Authentication**: The management API validates the `Authorization: Bearer <key>` header against the database.
2. **Event Validation**: The payload structure is validated against the defined schema.
3. **Internal Enqueueing**: Validated events are stored in PostgreSQL and metadata is sent to RabbitMQ.

## 📤 Outgoing Delivery (HMAC)
When a webhook is dispatched to a subscriber, it includes a signature:
`X-Webhook-Signature: sha256=<signature>`

### Verification Logic (for Consumers)
Consumers should verify the signature using the shared secret key:
1. Receive the raw HTTP body.
2. Calculate HMAC-SHA256 signature using the secret.
3. Compare the result with the `X-Webhook-Signature` header using a constant-time comparison.

```javascript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', SECRET_KEY);
hmac.update(rawBody);
const signature = hmac.digest('hex');
// match against header securely
```
