# 🔒 CipherVault by ABD

> **Your digital life, cryptographically secured with Zero-Knowledge AES-256-GCM encryption.**

[![Netlify Status](https://api.netlify.com/api/v1/badges/bde6422c-c558-477a-a43d-754bcf05b162/deploy-status)](https://app.netlify.com/projects/abd-ciphervault/deploys)
[![Live App](https://img.shields.io/badge/Live%20Demo-CipherVault-00f2fe?style=for-the-badge&logo=netlify)](https://abd-ciphervault.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌐 Live Server Link

- 🚀 **Live Web Application:** [https://abd-ciphervault.netlify.app](https://abd-ciphervault.netlify.app)
- ⚡ **Backend API Endpoint:** [https://abd-cipher-vault-be.vercel.app/](https://abd-cipher-vault-be.vercel.app/)

---

## 📸 Screenshots Gallery

| Landing Page | Glassmorphism Dashboard |
| :---: | :---: |
| ![Landing Page](public/screenshots/01-landing-page.png) | ![Glassmorphism Dashboard](public/screenshots/02-dashboard-glass.png) |

| Add Credential (Owner Selector) | Password Reveal & Security Dialog |
| :---: | :---: |
| ![Add Credential](public/screenshots/03-add-item-owner.png) | ![Login Screen](public/screenshots/04-login-page.png) |

| Profile & ImgBB Avatar Upload | Mobile Thumb-Friendly View |
| :---: | :---: |
| ![Profile Settings](public/screenshots/05-profile-settings.png) | ![Mobile Navigation](public/screenshots/06-mobile-view.png) |

---

## 📖 How to Use CipherVault – User Guide

### 1. **Creating an Account & Master Password**
- When signing up with Email & Password, choose a strong **Master Password**.
- Your Master Password is used locally with **Argon2id** key derivation to produce a 256-bit AES encryption key. 
- 🔒 **Zero-Knowledge Architecture:** Your Master Password and Master Key are **never** transmitted to our servers or stored in any database.

### 2. **1-Click Google Authentication**
- Click **Sign in with Google** for instant registration and access.
- Your Google profile photo is automatically synced with your profile.
- If you cancel or close the Google sign-in window, CipherVault handles it smoothly without scary error popups.

### 3. **Adding & Categorizing Passwords with Owner Badges**
- Click **Add Password** from the sidebar or mobile floating button.
- Select the **Credential Owner** using the pill radio buttons:
  - 👤 **Personal** — Private personal credentials
  - 🏠 **Family** — Shared family logins (Wi-Fi, Netflix, Utilities)
  - 🤝 **Friend** — Shared subscriptions or event logins
  - 🏷️ **Other** — Custom work or misc accounts
- Passwords are encrypted on your browser before saving.

### 4. **Revealing & Copying Encrypted Passwords**
- Click any password card on your dashboard to open the secure details modal.
- To view plaintext passwords, click **Reveal** and enter your Master Password to verify your identity.
- Unlocked passwords auto-hide after 15 seconds for your protection.

### 5. **Forgot Master Password & Email Reset**
- If you forget your account password, click **Forgot Password?** on the login screen.
- A secure password reset link will be sent directly to your registered email address.

### 6. **Uploading Custom Profile Avatars (ImgBB + Auto-Downscaling)**
- Go to **Settings & Profile** and click on your profile picture avatar.
- Choose any image from your device. CipherVault automatically **downscales and compresses** the image in your browser (max 300x300px, < 50KB size) before uploading.
- The compressed avatar is hosted securely via **ImgBB API** and synced across your session headers.

---

## ✨ Features & Highlights

- 🛡️ **AES-256-GCM Client-Side Encryption:** Military-grade zero-knowledge cryptographic vault.
- 🎨 **Navy Slate Glassmorphism UI:** Deep navy gradient backdrop with frosted glass panel containers (`backdrop-blur-xl`).
- 💎 **Vault Typography ("CipherVault by ABD"):** Custom `Orbitron` Google Font branding.
- 🔑 **30-Day Session Persistence:** Long-term JWT session tokens keep you signed in securely across browser sessions.
- 📱 **Mobile-First PWA:** Responsive, thumb-friendly navigation designed for mobile and desktop screens.
- ⚡ **Ultra-Fast Loading:** Optimized with Next.js App Router, dynamic component imports, and image compression.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Sonner.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), Firebase Admin SDK.
- **Cryptography:** Web Crypto API (`crypto.subtle`), Argon2id (`hash-wasm`).
- **Media & Storage:** ImgBB API, `browser-image-compression`.
- **Hosting & CI/CD:** Vercel / Netlify.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### 1. Clone the Repositories
```bash
git clone https://github.com/abdnimit1203/CipherVault-FE.git
git clone https://github.com/abdnimit1203/CipherVault-BE.git
```

### 2. Configure Environment Variables

Create `.env.local` inside `CipherVault-FE`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

Create `.env` inside `CipherVault-BE`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_30d_jwt_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Install & Run
```bash
# Backend
cd CipherVault-BE
npm install
npm run dev

# Frontend
cd CipherVault-FE
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

Distributed under the MIT License. Developed by **[ABD NIMIT](https://github.com/abdnimit1203)**.
