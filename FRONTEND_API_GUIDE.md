# Aaradhya Dream City — Broker API Guide
> **For Frontend Developers**  
> Base URL: `https://your-api-domain.com` (replace with actual domain)  
> All requests/responses are `application/json` unless stated otherwise.

---

## Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Registration Flow](#1-post-brokerregister)
3. [WhatsApp Verification](#2-post-brokerverify--whatsapp-webhook)
4. [WA Webhook Challenge (DevOps only)](#3-get-brokerverify--webhook-challenge)
5. [Login](#4-post-brokerlogin)
6. [Get Profile + Referral Tree](#5-get-brokerme)
7. [Complete Flow Walkthrough](#complete-flow-walkthrough)
8. [Error Reference](#error-reference)
9. [Tips & Gotchas](#tips--gotchas)

---

## Authentication Overview

All **protected routes** require a JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are long-lived (configurable, default 30 days). Store in `localStorage` or an HTTP-only cookie.

---

## 1. `POST /broker/register`

Register a new broker account. Returns a short token the user sends via WhatsApp to verify.

### Request

```http
POST /broker/register
Content-Type: application/json
```

```json
{
  "phone":       "919876543210",
  "password":    "StrongPass@123",
  "first_name":  "Ravi",
  "last_name":   "Sharma",
  "gender":      "Male",
  "pan_number":  "ABCDE1234F",
  "adhar_number":"123456789012",
  "email":       "ravi@example.com"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `phone` | string | ✅ | `91` + 10-digit mobile, e.g. `919876543210` |
| `password` | string | ✅ | Min 8 characters |
| `first_name` | string | ✅ | Non-empty |
| `last_name` | string | ✅ | Non-empty |
| `gender` | string | ✅ | Any non-empty string |
| `pan_number` | string | ✅ | Format `ABCDE1234F` (5 letters, 4 digits, 1 letter) |
| `adhar_number` | string | ✅ | Exactly 12 digits |
| `email` | string | ❌ | Valid email if provided, stored but not used for verification |

### Success Response — `201 Created`

```json
{
  "verify_token": "A3FX9Q2B",
  "wa_link":      "https://wa.me/919876543210?text=A3FX9Q2B",
  "message":      "Registration successful. Send the verify_token via WhatsApp..."
}
```

### What to do with this response

```
1. Store verify_token (or just use wa_link directly).
2. Render a WhatsApp button:
   → <a href={wa_link}>Verify via WhatsApp</a>
3. When user taps the button, WhatsApp opens pre-filled with the token.
4. User hits Send from their registered number.
5. Backend auto-verifies and replies on WhatsApp.
6. Redirect user to the login page.
```

> **Re-registration:** If the same phone re-registers before verifying, the old record is silently replaced. A fresh token is issued. This is intentional — no special handling needed on the frontend.

---

## 2. `POST /broker/verify` — WhatsApp Webhook

> **You do not call this endpoint from the frontend.**  
> This is called automatically by Meta's WhatsApp Cloud API when the user sends the token message. No frontend action required.

---

## 3. `GET /broker/verify` — Webhook Challenge

> **DevOps / backend only.** Used by Meta to verify the webhook URL during setup. Ignore this in frontend code.

---

## 4. `POST /broker/login`

Login with phone + password. Returns a JWT access token.

### Request

```http
POST /broker/login
Content-Type: application/json
```

```json
{
  "phone":    "919876543210",
  "password": "StrongPass@123"
}
```

### Success Response — `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type":   "bearer",
  "expires_in":   2592000
}
```

| Field | Description |
|---|---|
| `access_token` | JWT — attach to every protected request |
| `token_type` | Always `"bearer"` |
| `expires_in` | Seconds until expiry (2592000 = 30 days) |

### Store the token

```js
localStorage.setItem("access_token", data.access_token);
```

### Attach to every protected request

```js
const token = localStorage.getItem("access_token");

fetch("/broker/me", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

---

## 5. `GET /broker/me`

Returns the logged-in broker's full profile including referral information.

### Request

```http
GET /broker/me
Authorization: Bearer <access_token>
```

### Success Response — `200 OK`

```json
{
  "_id":           "664abc123def456...",
  "phone":         "919876543210",
  "email":         "ravi@example.com",
  "first_name":    "Ravi",
  "last_name":     "Sharma",
  "gender":        "Male",
  "pan_number":    "ABCDE1234F",
  "adhar_number":  "123456789012",
  "referral_code": "A1B2C3D4",
  "referred_by":   "ZZZZZZZZ",
  "verified":      true,
  "is_broker":     true,
  "created_at":    "2026-04-19T18:00:00Z",
  "updated_at":    "2026-04-19T18:05:00Z",

  "referred_by_user": {
    "_id":           "664xyz...",
    "first_name":    "Parent",
    "last_name":     "User",
    "phone":         "919111111111",
    "referral_code": "ZZZZZZZZ",
    "verified":      true
  },

  "referral_tree": [
    {
      "_id":           "664child1...",
      "first_name":    "Child",
      "last_name":     "One",
      "phone":         "919222222222",
      "referral_code": "CHILD001",
      "referred_by":   "A1B2C3D4",
      "verified":      true,
      "subtree_count": 1,
      "direct_referrals": [
        {
          "_id":           "664grandchild...",
          "first_name":    "Grand",
          "last_name":     "Child",
          "phone":         "919333333333",
          "referral_code": "GRND0001",
          "referred_by":   "CHILD001",
          "verified":      true,
          "subtree_count": 0,
          "direct_referrals": []
        }
      ]
    }
  ],

  "total_in_tree": 2
}
```

### Field Guide

| Field | Description |
|---|---|
| `referral_code` | This user's unique invite code — share this to recruit |
| `referred_by` | The referral code of whoever invited this user |
| `referred_by_user` | Full public profile of the person who invited this user (`null` if no referrer) |
| `referral_tree` | Full recursive tree of everyone this user has brought in (nested) |
| `referral_tree[n].direct_referrals` | That person's own referrals (recursive) |
| `referral_tree[n].subtree_count` | How many people are below that node |
| `total_in_tree` | Total number of users in this broker's entire downward network |

> **Sensitive fields stripped:** `password`, `verify_token`, `verify_token_expires`, `sessions` are never included in any response.

---

## Complete Flow Walkthrough

```
┌─────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                     │
└─────────────────────────────────────────────────────────┘

  Frontend                    Backend                  WhatsApp / Meta
     │                           │                           │
     │── POST /broker/register ──▶                           │
     │                           │ validate + upsert DB      │
     │◀── 201 { verify_token,    │                           │
     │          wa_link }        │                           │
     │                           │                           │
     │  [show WhatsApp button]   │                           │
     │  user taps → WA opens     │                           │
     │  pre-filled with token    │                           │
     │                           │                           │
     │                           │◀── POST /broker/verify ───│
     │                           │  (Meta sends user msg)    │
     │                           │ token match → verified=T  │
     │                           │──── WA reply "Verified" ──▶
     │                           │                           │
     │  [redirect to login]      │                           │


┌─────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                          │
└─────────────────────────────────────────────────────────┘

  Frontend                    Backend
     │                           │
     │── POST /broker/login ────▶│
     │                           │ check verified + password
     │◀── 200 { access_token }   │
     │                           │
     │  store token              │
     │── GET /broker/me ─────── ▶│ (Authorization: Bearer ...)
     │◀── 200 { profile +        │
     │          referral_tree }  │
```

---

## Error Reference

All errors follow this shape:

```json
{
  "detail": "Human-readable message here.",
  "code":   "HTTP_ERROR"
}
```

| Status | When |
|---|---|
| `400` | Validation failed (bad phone format, short PAN, etc.) — `detail` lists all issues separated by `;` |
| `401` | Wrong password, missing/expired/invalid token |
| `403` | Account not yet verified (send WA token first) |
| `404` | No account found for the phone number, or user not found by token |
| `409` | Phone already registered **and verified** — direct user to login |
| `500` | Server error — please report to backend team |

### Handling 400 (multiple validation errors)

```js
if (res.status === 400) {
  const { detail } = await res.json();
  // detail is a semicolon-separated list of errors:
  // "phone must be in format 91XXXXXXXXXX; pan_number must match..."
  const errors = detail.split(";").map(e => e.trim());
  // show each error under its field
}
```

---

## Tips & Gotchas

### Phone number format
Always send **`91XXXXXXXXXX`** — no `+`, no spaces, no dashes.
```js
// sanitize before sending
const phone = rawPhone.replace(/\D/g, "");  // strip non-digits
// ensure it starts with 91
```

### WhatsApp button
The `wa_link` from the register response is ready to use directly:
```jsx
<a href={data.wa_link} target="_blank" rel="noopener noreferrer">
  Verify via WhatsApp
</a>
```
On mobile this opens WhatsApp natively. On desktop it opens web.whatsapp.com.

### Referral code pre-fill at registration
If you want to track who invited who, pass the referrer's `referral_code` in the URL. Parse it in the `RegisterRequest` as `referred_by`:
```
/register?ref=A1B2C3D4
```
```js
const referred_by = new URLSearchParams(location.search).get("ref");
// include in the POST body:
// { ...fields, referred_by }
```
> Backend currently stores `referred_by` on the user document. Confirm this field is wired in the backend `build_user` call.

### Token expiry
`expires_in` is in **seconds**. Show a re-login prompt if you receive a `401` on a protected route.

```js
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    return;
  }

  return res.json();
}
```

### Interactive docs (Swagger)
While in development, the full interactive API docs are available at:
```
http://localhost:2560/docs
```
You can test every endpoint directly in the browser.
