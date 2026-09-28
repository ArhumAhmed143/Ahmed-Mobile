# Ahmed Moblie Production Deployment & Launch Manual

Welcome to the official production deployment guide for **Ahmed Moblie** — a mobile accessories and electronics store.

This guide provides step-by-step instructions for deploying Ahmed Moblie to production hosting services.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: Production Database Setup (MongoDB Atlas)](#step-1-production-database-setup-mongodb-atlas)
3. [Step 2: Backend Node.js API Deployment](#step-2-backend-nodejs-api-deployment)
4. [Step 3: Image Storage Strategy (VPS vs Cloud Object Storage)](#step-3-image-storage-strategy-vps-vs-cloud-object-storage)
5. [Step 4: Frontend React + Vite SPA Deployment](#step-4-frontend-react--vite-spa-deployment)
6. [Step 5: NayaPay Business & Payment Provider Onboarding](#step-5-nayapay-business--payment-provider-onboarding)
7. [Step 6: Custom Domain & DNS Setup](#step-6-custom-domain--dns-setup)
8. [Step 7: Security & Backup Checklist](#step-7-security--backup-checklist)

---

## 1. Architecture Overview

```
Customer & Admin Browsers
         │ (HTTPS)
         ├─────────────────────────────────────┐
         ▼                                     ▼
Frontend SPA (Vercel / Netlify)       Backend API (Render / DigitalOcean)
https://www.nexorahub.com              https://api.nexorahub.com
         │                                     │
         └───────────────────► Axios ──────────┤
                                               ▼
                                      MongoDB Atlas Cluster
                                      (Managed MongoDB)
                                               │
                                               ▼
                                      Persistent File Storage
                                      (AWS S3 / Cloudinary / VPS Uploads)
```

---

## Step 1: Production Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas project and cluster, then create a database user with a strong password.
2. Add the backend host's IP address to Atlas Network Access. For local development, add your current IP address.
3. Copy the driver's connection string and replace its username, password, and cluster host. Use `ahmed_mobile` as the database name in the URI path.
4. Seed starter categories and products after setting `MONGODB_URI`:
   ```bash
   cd backend
   npm run seed
   ```
5. Create an administrator account after setting `ADMIN_USERNAME` and `ADMIN_PASSWORD`:
   ```bash
   npm run create-admin
   ```

---

## Step 2: Backend Node.js API Deployment

### Preferred Hosting Services:
- **VPS / Cloud Server**: DigitalOcean Droplet, Linode, AWS EC2, Hetzner (Recommended for persistent disk storage).
- **Platform-as-a-Service**: Render, Railway, Heroku.

### Environment Configuration (`backend/.env`):
Set the following environment variables in your server hosting control panel:

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas connection string; keep credentials URL-encoded when needed
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/ahmed_mobile?retryWrites=true&w=majority

# Security Secrets
JWT_SECRET=production_super_secret_jwt_key_random_64_chars

# Domain & CORS Configuration
FRONTEND_URL=https://www.nexorahub.com

# Order & Delivery Settings
DELIVERY_FEE=200

# Payment Credentials
PAYMENT_PROVIDER=nayapay
PAYMENT_API_KEY=your_official_merchant_api_key
PAYMENT_API_SECRET=your_official_merchant_api_secret
PAYMENT_WEBHOOK_SECRET=your_webhook_signature_secret
PAYMENT_CALLBACK_URL=https://api.nexorahub.com/api/payments/webhook
CURRENCY=PKR

# Brevo email delivery
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=verified-sender@example.com
BREVO_SENDER_NAME=Ahmed Moblie
BREVO_NEWSLETTER_LIST_ID=your_brevo_contact_list_id
BREVO_ADMIN_EMAIL=store-admin@example.com
```

Create a Brevo API key and verify the sender address in Brevo before enabling email delivery. Newsletter signups are added to `BREVO_NEWSLETTER_LIST_ID` when configured. Order confirmations go to customers, optional new-order notifications go to `BREVO_ADMIN_EMAIL`, and payment/order status changes send customer updates. Keep the API key only in the backend environment; never add it to frontend variables.

### Start Server Command:
```bash
npm install --production
npm start
```

---

## Step 3: Image Storage Strategy (VPS vs Cloud Object Storage)

- **Option A (VPS Deployment)**: If you deploy the backend to a dedicated VPS server (DigitalOcean / EC2), product uploads stored in `backend/uploads/products/` will automatically persist on the disk.
- **Option B (Serverless Hosting like Vercel / Render Free)**: Serverless functions reset disk memory on every restart. For serverless deployments, integrate AWS S3 or Cloudinary by configuring an object storage bucket and setting `BACKEND_PUBLIC_URL=https://your-bucket.s3.amazonaws.com`.

---

## Step 4: Frontend React + Vite SPA Deployment

### Preferred Hosting Services:
- **Vercel** / **Netlify** / **Cloudflare Pages** (Free SSL, automatic global CDN distribution).

### Deployment Steps (Vercel):
1. Connect your GitHub repository to Vercel.
2. Select the `frontend/` directory as the root folder.
3. Configure the Build Command & Directory:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variable:
   ```env
   VITE_API_URL=https://api.nexorahub.com/api
   ```
5. Click **Deploy**.

---

## Step 5: NayaPay Business & Payment Provider Onboarding

1. Register for an official **NayaPay Business Account** at [https://www.nayapay.com/business](https://www.nayapay.com/business).
2. Complete merchant onboarding & identity verification.
3. Obtain your official merchant credentials:
   - `PAYMENT_API_KEY`
   - `PAYMENT_API_SECRET`
   - `PAYMENT_WEBHOOK_SECRET`
4. Enter these credentials into your backend production environment settings.

> Important security rule: Never collect or store customer card numbers, CVV, or PINs inside Ahmed Moblie. Payments must process through official merchant redirect links or webhooks.

---

## Step 6: Custom Domain & DNS Setup

Point your domain (e.g. `nexorahub.com`) to your deployed services:

| Type | Name | Target / Value | Purpose |
|------|------|----------------|---------|
| `CNAME` | `www` | `cname.vercel-dns.com` | Customer Frontend Website |
| `CNAME` | `api` | `nexorahub-backend.onrender.com` | Express Backend API |
| `A` | `@` | `76.76.21.21` | Apex Domain Forwarding |

---

## Step 7: Security & Backup Checklist

- [x] **SSL / HTTPS**: Enforce HTTPS on both `https://www.nexorahub.com` and `https://api.nexorahub.com`.
- [x] **Helmet HTTP Headers**: Enforced via `helmet()` middleware.
- [x] **Rate Limiting**: `authLimiter` (15 login attempts per 15 min), `checkoutLimiter`, and `apiLimiter` active.
- [x] **Strict CORS**: Restricted exclusively to `FRONTEND_URL`.
- [x] **Database Backups**: Schedule daily automated MySQL database dumps:
  ```bash
   mongodump --uri="$MONGODB_URI" --out="backup-$(date +%F)"
  ```
- [x] **Zero Card Data Storage**: Confirmed 100% compliant with zero card credential storage.

---

### 🎉 Production Launch Status: 100% READY!
