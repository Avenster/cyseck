
---

# Fullstack OTP Authentication System

## Project Overview

This project is a minimal full-stack web application designed to demonstrate a secure, OTP-based passwordless authentication flow. It supports both Email and SMS (via Twilio) delivery methods. The system implements "Lazy Registration," automatically creating accounts for new users upon successful verification.

## High-Level Design

### 1. Architecture Overview

The application follows a standard Client-Server architecture:

* **Frontend (Client):** A Single Page Application (SPA) built with React Router v7 and Tailwind CSS. It handles user input, client-side validation, and session management via JWT storage in LocalStorage.
* **Backend (Server):** A RESTful API built with Node.js and Express. It acts as the central controller for business logic, managing OTP generation, validation rules, and session token issuance.
* **Data Layer:** For the scope of this challenge, data persistence (Users, OTPs, Blocklists) is handled via **In-Memory Storage** (JavaScript Objects/Arrays). This ensures zero-configuration setup but means data is volatile and resets on server restart.

### 2. OTP Generation & Validation Strategy

* **Generation:** A cryptographically pseudo-random 6-digit integer is generated upon request.
* **Storage:** The OTP is stored in an in-memory Map structure keyed by the user's identifier (Email or Phone).
* *Structure:* `Map<Identifier, { code, expiresAt }>`
* *TTL:* The entry automatically becomes invalid after 10 minutes.


* **Validation Logic:**
1. **Block Check:** The system first checks if the identifier is in the `BlockStore` due to prior excessive failures.
2. **Existence & Expiry:** Checks if an OTP exists and if `CurrentTime < ExpiresAt`.
3. **Matching:** Compares the input OTP against the stored hash.


* **Security (Rate Limiting):**
* We track failed attempts in a `BlockStore`.
* Rule: If a user fails 3 consecutive attempts, their identifier is blocked for 10 minutes.



### 3. Tech Stack

* **Frontend:** React (React Router v7), TypeScript, Tailwind CSS.
* **Backend:** Node.js, Express.js.
* **Authentication:** JSON Web Tokens (JWT).
* **Delivery Services:**
* **Email:** Nodemailer (SMTP/Gmail).
* **SMS:** Twilio SDK (Trial Account).



### 4. Assumptions & Constraints

* **Persistence:** All data is ephemeral. Restarting the server wipes all users and active OTPs.
* **Twilio Trial:** SMS delivery is restricted to verified caller IDs due to Twilio trial limitations.
* **Security:** In a production environment, secrets (JWT keys, API Tokens) would be managed via a secrets manager, and OTPs would be stored in Redis with automatic TTL eviction.
* **DNS:** The backend explicitly enforces IPv4 resolution to prevent connectivity issues with Gmail SMTP on certain local networks.

---

## Setup Instructions

### Prerequisites

* Node.js (v16+)
* npm

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install

```

Create a `.env` file in the `backend` root with the following credentials:

```env
JWT_SECRET=your_secure_random_string
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

```

Start the server:

```bash
node server.js

```

The server will run on `http://localhost:3000`.

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install

```

Start the development server:

```bash
npm run dev

```

Access the application at `http://localhost:5173`.

---

## API Documentation

### POST /auth/request-otp

Generates and sends an OTP to the provided identifier.

* **Payload:** `{ "identifier": "user@example.com" }` or `{ "identifier": "9876543210" }`
* **Response:** `{ "message": "OTP sent to email" }`

### POST /auth/verify-otp

Validates the OTP and returns a session token. Auto-creates the user if they do not exist.

* **Payload:** `{ "identifier": "user@example.com", "otp": "123456" }`
* **Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Ankur", "email": "..." }
}

```



### GET /auth/me

Protected route to retrieve the current user's profile.

* **Headers:** `Authorization: Bearer <token>`
* **Response:** User profile object.

---

## Folder Structure

```text
/project-root
  ├── /backend
  │     ├── server.js        # Main application entry point
  │     ├── .env             # Environment variables (GitIgnored)
  │     └── package.json     # Backend dependencies
  │
  └── /frontend
        ├── /app
        │     ├── /routes    # React Router pages (Login, Verify, Welcome)
        │     └── app.css    # Global styles (Tailwind directives)
        └── package.json     # Frontend dependencies

```