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