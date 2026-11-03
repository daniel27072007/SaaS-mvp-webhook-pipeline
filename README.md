# SaaS MVP Webhook Pipeline (Automated Billing & RBAC Engine)
**A secure, production-ready full-stack SaaS platform with automated Stripe checkout, real-time webhook processing, and tier-based RBAC.**

A modern, highly secure SaaS MVP architecture built with **Node.js (Express)**, **MongoDB (Mongoose)**, **React 19**, **Vite v8**, and **Tailwind CSS v4**. It demonstrates end-to-end commercial subscription management—from user registration and tier upgrades to real-time Stripe webhook synchronization and Role-Based Access Control (RBAC) enforcement across backend API endpoints and frontend interfaces.

---

## The Problem
Building modern subscription-based SaaS applications introduces complex architectural challenges regarding payment synchronization, state management, and API access control:
* **Stale Session Data & JWT Out-of-Sync:** Static JWT tokens issued at login become outdated as soon as a user completes an external payment or cancels a subscription, causing the client UI to render stale permission states until a forced re-login.
* **Race Conditions in Webhook Processing:** Asynchronous delays between external payment gateways (e.g., Stripe) and internal database updates often result in premature client profile checks, displaying old tier permissions immediately after checkout completion.
* **Duplicate Subscriptions & Billing Exploits:** Allowing active subscribers to repeatedly invoke new checkout sessions can cause orphaned subscriptions, prorated billing errors, or duplicate charges on the payment processor.
* **Insecure Tier Escalation during Registration:** Accepting arbitrary subscription tier flags directly from public registration payloads enables malicious actors to bypass payment gateways and claim paid access levels for free.

---

## The Solution
This application delivers a secure, resilient SaaS architecture designed around strict payment verification, real-time database-to-session polling, and dynamic tier-aware UI interfaces.

### What this system automatically handles for you:
* **Secure Registration Safeguards:** Enforces strict server-side fallback rules during user registration, setting all new accounts to a `none` subscription state regardless of client-side request inputs.
* **Session Refresh & Token Renewal Pipeline:** Provides a profile synchronization service (`refreshUserSubscription`) that fetches live database profiles, issues updated access tokens, and updates the global React `AuthContext` seamlessly.
* **Polled Webhook State Reconciliation:** Implements an asynchronous retry loop upon payment return (`DashboardPage`), polling the database until the Stripe webhook confirms processing before unlocking restricted features.
* **Smart UI & Upgrade Routing (`LandingPage`):** Dynamically computes button states (`Current Plan`, `Upgrade`, `Go to Dashboard`, or `Sign In`) based on the authenticated user's active tier to prevent redundant checkouts.
* **Atomic Subscription Upgrade Engine:** Detects active Stripe customer IDs and subscription IDs during checkout requests, executing atomic subscription modifications with proration instead of creating duplicate billing records.
* **Automated Webhook Lifecycle Listener:** Intercepts raw Stripe signature bodies to process `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events in real time.

---

## Interface Specifications & Technical Walkthrough
This section outlines how authentication payloads, subscription states, and API permissions are structured and processed across the system.

### 1. Database Schema & User Domain Topology
The user model stores essential account credentials alongside Stripe identifiers and active subscription status markers.

#### User Domain Model (`user.model.js`)
* **Identity Fields:** Unique string `name`, lowercase unique string `email`, and salt-hashed string `password` (processed via `bcrypt`).
* **Subscription Tier Constraint:** Restricted enum string (`'none' | 'normal' | 'premium'`) defaulting to `'none'`.
* **Subscription Status Marker:** Restricted enum string (`'none' | 'active' | 'past_due' | 'canceled' | 'trialing'`) defaulting to `'none'`.
* **Stripe Mapping Keys:** Nullable string references for `paymentCustomerId` and `stripeSubscriptionId`.

```json
{
  "_id": "65b2a1f8e4b1a2001c9f8a3d",
  "name": "Daniel Belculfine",
  "email": "daniel@example.com",
  "subscription": "premium",
  "subscriptionStatus": "active",
  "paymentCustomerId": "cus_N3x9L0PqRstUVw",
  "stripeSubscriptionId": "sub_1UTPox1YFbGwh7Z0qaR2IfWB",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:05:00.000Z"
}
```

### 2. Role-Based Access Control (RBAC) Architecture
The system enforces strict permission boundaries at both middleware and frontend levels:
* **Tier 0 (`none`):** Access to public routes, core authentication, and basic Dashboard Overview metrics. Advanced report pipelines and AI Advisor insights are blocked.
* **Tier 1 (`normal`):** Unlocks the interactive **Analytics Report Pipeline** and dynamic Recharts chart generation suite. AI Advisor insights remain masked with upgrade CTAs.
* **Tier 2 (`premium`):** Full system access, unlocking real-time AI Advisor Optimization Insights, advanced financial metrics, and executive AI summary cards.

```javascript
// Express RBAC Middleware enforcement (auth.middleware.js)
export const authMiddleware = (allowedSubscriptions) => {
  return async (req, res, next) => {
    // Extracts Bearer token, verifies signature, and checks user tier against allowed tier array
    if (!allowedSubscriptions.includes(req.userSubscription)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient tier access' });
    }
    next();
  };
};
```

---

## Project Architecture
```text
SaaS-mvp-webhook-pipeline/
├── backend/                  # Server-side API and database environment
│   ├── src/
│   │   ├── config/           # MongoDB database connection configuration
│   │   ├── controllers/      # Auth, Features, User, and Stripe Payment controllers
│   │   ├── middlewares/      # JWT authentication and RBAC authorization middleware
│   │   ├── models/           # Mongoose schemas (User model)
│   │   ├── routes/           # Express router endpoints (Auth, Features, Payments, Users)
│   │   └── app.js            # Express application initialization & Stripe raw webhook parser
│   ├── .env                  # Backend environment variables (DB URI, JWT keys, Stripe secrets)
│   ├── package.json          # Server dependencies (Express, Mongoose, Stripe SDK, Bcrypt, JWT)
│   └── server.js             # HTTP server entrypoint
├── frontend/                 # Client-side React application
│   ├── src/
│   │   ├── components/       # AuthHeader and PrivateRoute guards
│   │   ├── context/          # AuthContext provider and session state engine
│   │   ├── pages/            # LandingPage, LoginPage, RegisterPage, DashboardPage, ProfilePage
│   │   ├── services/         # Axios API client and Stripe checkout/cancel payment utilities
│   │   ├── App.jsx           # React Router DOM routing configuration
│   │   ├── main.jsx          # Virtual DOM application mount point
│   │   └── index.css         # Tailwind CSS framework styling
│   ├── .env.local            # Frontend API URL configuration
│   ├── package.json          # Client dependencies (React 19, Axios, Recharts, Lucide, Tailwind)
│   └── vite.config.js        # Vite build engine setup
└── README.md                 # System documentation
```

---

## Installation & Local Deployment Guide
To run this application locally, ensure you have **Node.js** and **MongoDB** installed, then follow the commands below in your terminal.

### 1. Configure Environment Variables

#### Backend Environment Setup (`backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
PORT=3000
MONGO_URI_DB=mongodb://localhost:27017/saas_mvp
TOKEN_ACCESS_KEY=your_secure_jwt_secret_key
TOKEN_ACCESS_KEY_EXPIRES=15m
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_NORMAL_PRICE=price_your_normal_plan_price_id
STRIPE_PREMIUM_PRICE=price_your_premium_plan_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

#### Frontend Environment Setup (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3000
```

### 2. Install Dependencies & Launch Backend
```bash
cd backend
npm install
npm start
```

### 3. Install Dependencies & Launch Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Listen to Local Stripe Webhooks (Optional for Testing)
To forward Stripe events to your local server during checkout testing, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## Ecosystem Breakdown

| System Element | Core Tool | Architectural Edge |
| :--- | :--- | :--- |
| **Backend Engine** | Express 5 / Node.js | Asynchronous request processing with built-in raw body verification for webhooks. |
| **Database & ORM** | MongoDB / Mongoose | Flexible document schema with pre-save password hashing hooks and unique indexing. |
| **Payment Processor** | Stripe API v23 | Automated hosted checkout, prorated upgrades, and event-driven webhook lifecycles. |
| **Frontend Framework** | React 19 / Vite v8 | High-performance Virtual DOM execution with Instant Hot Module Replacement (HMR). |
| **Data Visualization** | Recharts v3 | Responsive, interactive data graphics rendered dynamically from RBAC endpoints. |
| **Styling Engine** | Tailwind CSS v4 | Zero-runtime CSS processing for dark-mode corporate dashboard interfaces. |

---

## Final Comparison Matrix: Architecture vs Tradition

| Feature Attribute | Traditional MVP Approach | Robust SaaS MVP Pipeline |
| :--- | :--- | :--- |
| **User Registration Security** | Trusts client input for initial subscription states, risking unauthorized access. | Forces initial subscription state to `none` on the server regardless of payload inputs. |
| **Post-Payment Sync** | Requires manual logout/login to reflect updated plan tiers inside JWT tokens. | Auto-polls database profiles upon return, re-issuing fresh JWTs and updating UI states in real time. |
| **Upgrade Management** | Creates duplicate subscriptions for existing users upgrading their plans. | Retrieves active Stripe subscription IDs and executes atomic plan updates with proration. |
| **Landing Page Usability** | Shows static "Subscribe" buttons to active subscribers, causing duplicate charges. | Renders dynamic button states (`Current Plan`, `Upgrade`, or `Go to Dashboard`) based on live user tiers. |
| **Webhook Interception** | Relies on standard parsed JSON bodies, breaking cryptographic signature checks. | Captures raw request buffer streams specifically for webhook routes to verify Stripe signatures safely. |