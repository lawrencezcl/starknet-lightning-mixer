# API Documentation

This document provides comprehensive information about the Starknet Lightning Mixer API endpoints, authentication, and usage examples.

## 🌐 Base URL

- **Production**: `https://starknet-lightning-mixer.vercel.app/api`
- **Development**: `http://localhost:3003/api`

## 🔐 Authentication

Currently, the API does not require authentication for public endpoints. For protected endpoints, API keys will be required.

### Headers

```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (if required)
```

## 📋 Endpoints

### Mixing Endpoints

#### Create Mix

Initiates a new mixing transaction.

```http
POST /api/mixing/create
```

**Request Body:**

```json
{
  "amount": "0.5",
  "token": "ETH",
  "recipientAddress": "0x1234...",
  "privacySettings": {
    "enhancedPrivacy": true,
    "torNetwork": false,
    "randomDelays": true,
    "splitTransactions": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "mix_1234567890abcdef",
    "depositAddress": "0xabcdef1234567890",
    "estimatedTime": "5-10 minutes",
    "fee": "0.0015 ETH"
  }
}
```

#### Get Mix Status

Retrieves the status of an existing mixing transaction.

```http
GET /api/mixing/status/{transactionId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "mix_1234567890abcdef",
    "status": "processing",
    "progress": 65,
    "estimatedTimeRemaining": "3 minutes",
    "steps": [
      {
        "name": "Deposit Received",
        "status": "completed",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "name": "Lightning Conversion",
        "status": "completed",
        "timestamp": "2024-01-15T10:32:00Z"
      },
      {
        "name": "Cashu Mixing",
        "status": "processing",
        "timestamp": null
      },
      {
        "name": "Final Withdrawal",
        "status": "pending",
        "timestamp": null
      }
    ]
  }
}
```

#### Cancel Mix

Cancels an ongoing mixing transaction (if possible).

```http
POST /api/mixing/cancel/{transactionId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "mix_1234567890abcdef",
    "status": "cancelled",
    "refundAmount": "0.4985 ETH",
    "refundAddress": "0x1234..."
  }
}
```

### Transaction Endpoints

#### Get Transaction History

Retrieves the transaction history for a user.

```http
GET /api/transactions/history?address={walletAddress}&page={page}&limit={limit}
```

**Query Parameters:**

- `address` (string, required): Wallet address
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (`completed`, `processing`, `failed`)

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "mix_1234567890abcdef",
        "type": "deposit",
        "amount": "0.5",
        "token": "ETH",
        "status": "completed",
        "timestamp": "2024-01-15T10:30:00Z",
        "txHash": "0xabcdef1234567890",
        "privacyScore": 95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Transaction Details

Retrieves detailed information about a specific transaction.

```http
GET /api/transactions/{transactionId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "mix_1234567890abcdef",
    "type": "deposit",
    "amount": "0.5",
    "token": "ETH",
    "status": "completed",
    "timestamp": "2024-01-15T10:30:00Z",
    "txHash": "0xabcdef1234567890",
    "depositAddress": "0x1234567890abcdef",
    "withdrawalAddress": "0x0987654321fedcba",
    "fee": "0.0015 ETH",
    "privacyScore": 95,
    "steps": [
      {
        "name": "Deposit Received",
        "status": "completed",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Deposit of 0.5 ETH received"
      }
    ]
  }
}
```

### Lightning Network Endpoints

#### Create Lightning Invoice

Creates a Lightning Network invoice for a transaction.

```http
POST /api/lightning/invoice
```

**Request Body:**

```json
{
  "amount": "0.5",
  "description": "Starknet Lightning Mixer - Transaction mix_1234567890abcdef"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "invoice": "lnbc1234567890abcdef...",
    "paymentHash": "payment_hash_123456",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

#### Check Lightning Payment

Checks the status of a Lightning Network payment.

```http
GET /api/lightning/payment/{paymentHash}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "paymentHash": "payment_hash_123456",
    "status": "completed",
    "amount": "0.5",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### Cashu Endpoints

#### Create Cashu Tokens

Creates Cashu e-cash tokens for privacy mixing.

```http
POST /api/cashu/mint
```

**Request Body:**

```json
{
  "amount": "0.5",
  "mintUrl": "https://mint.cashu.space"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "amount": 1000000,
        "secret": "secret_123456",
        "proof": "proof_abcdef"
      }
    ],
    "keysetId": "keyset_123456"
  }
}
```

#### Redeem Cashu Tokens

Redeems Cashu e-cash tokens.

```http
POST /api/cashu/redeem
```

**Request Body:**

```json
{
  "tokens": [
    {
      "amount": 1000000,
      "secret": "secret_123456",
      "proof": "proof_abcdef"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "amount": "0.5",
    "redeemedAt": "2024-01-15T10:40:00Z"
  }
}
```

### Support Endpoints

#### Get Supported Tokens

Retrieves the list of supported tokens.

```http
GET /api/tokens/supported
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "decimals": 18,
      "minAmount": "0.01",
      "maxAmount": "10"
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6,
      "minAmount": "1",
      "maxAmount": "10000"
    }
  ]
}
```

#### Get Fee Information

Retrieves current fee information.

```http
GET /api/fees/current
```

**Response:**

```json
{
  "success": true,
  "data": {
    "mixerFee": "0.3",
    "lightningFee": "0.01",
    "networkFees": {
      "ETH": "0.0001",
      "USDC": "0.5"
    },
    "estimatedTotal": "0.3%"
  }
}
```

#### Get System Status

Retrieves the current system status.

```http
GET /api/system/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "operational",
    "network": "testnet",
    "version": "0.1.0",
    "uptime": "99.9%",
    "services": {
      "starknet": "operational",
      "lightning": "operational",
      "cashu": "operational"
    }
  }
}
```

## 🚨 Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `INSUFFICIENT_FUNDS` | 400 | Insufficient balance for transaction |
| `TRANSACTION_NOT_FOUND` | 404 | Transaction ID not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Internal server error |

## 📝 Example Usage

### JavaScript/TypeScript

```typescript
// Create a new mix
const createMix = async () => {
  const response = await fetch('/api/mixing/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '0.5',
      token: 'ETH',
      recipientAddress: '0x1234...',
      privacySettings: {
        enhancedPrivacy: true,
        randomDelays: true
      }
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Mix created:', result.data.transactionId);
  } else {
    console.error('Error:', result.error.message);
  }
};

// Check mix status
const checkStatus = async (transactionId: string) => {
  const response = await fetch(`/api/mixing/status/${transactionId}`);
  const result = await response.json();

  if (result.success) {
    console.log('Status:', result.data.status);
    console.log('Progress:', result.data.progress + '%');
  }
};
```

### Python

```python
import requests
import json

def create_mix():
    url = "http://localhost:3003/api/mixing/create"
    payload = {
        "amount": "0.5",
        "token": "ETH",
        "recipientAddress": "0x1234...",
        "privacySettings": {
            "enhancedPrivacy": True,
            "randomDelays": True
        }
    }

    response = requests.post(url, json=payload)
    result = response.json()

    if result["success"]:
        print(f"Mix created: {result['data']['transactionId']}")
    else:
        print(f"Error: {result['error']['message']}")

def check_status(transaction_id):
    url = f"http://localhost:3003/api/mixing/status/{transaction_id}"
    response = requests.get(url)
    result = response.json()

    if result["success"]:
        print(f"Status: {result['data']['status']}")
        print(f"Progress: {result['data']['progress']}%")
```

### cURL

```bash
# Create a new mix
curl -X POST http://localhost:3003/api/mixing/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "0.5",
    "token": "ETH",
    "recipientAddress": "0x1234...",
    "privacySettings": {
      "enhancedPrivacy": true,
      "randomDelays": true
    }
  }'

# Check mix status
curl http://localhost:3003/api/mixing/status/mix_1234567890abcdef

# Get transaction history
curl "http://localhost:3003/api/transactions/history?address=0x1234...&page=1&limit=10"
```

## 🔒 Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per API key
- **WebSocket connections**: 10 concurrent connections per IP

## 📚 Additional Resources

- [SDK Documentation](./sdk.md)
- [Webhook Documentation](./webhooks.md)
- [Examples Repository](https://github.com/starknet-lightning-mixer/examples)

## 🆘 Support

If you encounter any issues with the API:

1. Check the [API Status](/api/system/status)
2. Review the [Troubleshooting Guide](./troubleshooting.md)
3. Contact support at api@starknetlightning.mixer
4. Open an issue on [GitHub](https://github.com/lawrencezcl/starknet-lightning-mixer/issues)

---

*Last updated: January 2024*