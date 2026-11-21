# 🚩 Shree Mahadev Yuvak Mandal (શ્રી મહાદેવ યુવક મંડળ)
### Ganesh Utsav 12-Month Fund Tracker & Automated WhatsApp Bot System (2026-2027)

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933.svg?logo=node.js)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys_Automation-25D366.svg?logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)

---

## 📖 Overview

**Shree Mahadev Yuvak Mandal** is a modern, responsive, full-stack community management and donation-tracking platform created for Ganesh Mahotsav. Built with **React 19**, **Tailwind CSS v4**, and a dedicated **Node.js Express backend**, it eliminates manual bookkeeping and paper receipts with automated WhatsApp notifications, real-time multi-device cloud synchronization, public self-registration, and PIN-protected admin controls.

---

## ✨ Key Features

### 1. 📊 12-Month Contribution Matrix (Oct 2026 – Sep 2027)
- **Complete Festival Cycle**: Tracks monthly dues across the full 12-month calendar (October to September).
- **Visual Status Tracking**:
  - 🟢 **Green (Paid)**: Instant verification showing amount, date, and mode (UPI / Cash).
  - 🔴 **Red (Due)**: 1-click modal to record payments, select multiple months, or send reminders.
- **Dynamic KPI Dashboard**: Live tracking of total funds raised, monthly collection rates, pending dues, total expenditures, and net surplus.
- **Passbook & Ledger View**: Individual passbooks for each member displaying detailed transaction histories.

### 2. 🤖 Automated WhatsApp Bot (Baileys Engine)
- **Smart Salutation Detection**: Automatically recognizes Gujarati names and greets members respectfully:
  - Female members: e.g., *Pooja* ➔ `"નમસ્તે પૂજા બહેન"`
  - Male members: e.g., *Hitesh* ➔ `"નમસ્તે હિતેશભાઈ"`
- **1st of the Month Auto-Scheduler (Cron)**: Built-in background cron job that automatically dispatches monthly dues reminders on the 1st of every month at 09:00 AM without manual intervention.
- **Instant Digital Receipts**: Generates and sends formatted digital WhatsApp receipts for single or multi-month advances (2, 3, 6, or 12 months) immediately upon payment confirmation.
- **Transparency Group Reports**: Generates detailed Gujarati group status reports for copy-pasting directly into community WhatsApp groups.

### 3. 🛡️ Centralized Admin Security & PIN Lock
- **Role-Based Access Control**:
  - **Public Members**: Can view official accounts, scan the payment QR, pay via UPI, and self-register. Cannot alter financial details or hijack the bot.
  - **Lead Administrator (Manthan Kadam)**: Protected by a secure Admin PIN (`1020`).
- **Protected Actions (Admin Only)**:
  - Uploading or replacing custom QR code images.
  - Modifying the official Treasurer UPI ID (`rajmakwna4512@okaxis`).
  - Scanning the master WhatsApp QR pairing code.
  - Disconnecting or managing the WhatsApp bot session.
  - Performing mass-dispatch or clearing member records.

### 4. 👥 Public Self-Registration (✨ સભ્ય તરીકે જાતે જોડાઓ)
- Allows community members to enroll themselves directly from their smartphones.
- Automatically suggests salutations (*Bhai* / *Ben*), validates 10-digit mobile numbers, and prevents duplicate registrations.
- Features celebratory confetti animations (`canvas-confetti`) upon joining and offers instant WhatsApp welcome verification.

### 5. 🔄 Real-Time Multi-Device Cloud Synchronization
- Powered by a unified REST API (`/api/data`, `/api/members/join`, `/api/sync-data`) backed by a centralized JSON datastore.
- Background polling ensures that any update made on one phone (new registrations, payment check-offs) is reflected across all devices in real time without refreshing.
- Integrated offline caching (`localStorage`) guarantees instant page loads even on slow networks.

### 6. 📱 100% Mobile Responsive UI
- Specially optimized for smartphone screens with thumb-friendly buttons, responsive modals, swipe-guidance banners, and fast touch feedback.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express 5, Node-Cron, Pino Logger |
| **WhatsApp Automation** | `@whiskeysockets/baileys` (Multi-device socket protocol) |
| **Storage & Database** | Centralized JSON Storage (`data/database.json`), LocalStorage Cache |
| **Deployment** | Vercel (Frontend), Node.js server (Backend & Bot) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manthan-Kadam/mahadev-yuvak-mandal.git
   cd mahadev-yuvak-mandal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   *Frontend will be running at:* `http://localhost:5173/`

4. **Start the backend & WhatsApp Bot server:**
   ```bash
   npm run server
   ```
   *Server will be running at:* `http://localhost:3001/`

---

## 🌐 Production Deployment

### 1. Frontend Deployment (Vercel)
1. Fork or push this repository to your GitHub account (`Manthan-Kadam/mahadev-yuvak-mandal`).
2. Log into [Vercel](https://vercel.com) using your GitHub account.
3. Import the `mahadev-yuvak-mandal` repository.
4. The project includes a pre-configured `vercel.json` file—simply click **Deploy**!
5. Your live site will be ready in under a minute (e.g., `https://mahadev-yuvak-mandal.vercel.app`).

### 2. Backend & WhatsApp Bot Deployment (Render / Cloud VPS)
Because the WhatsApp bot engine requires a persistent background Node.js process and socket connection:
1. Deploy `server.js` to a free Node service like [Render.com](https://render.com) or [Railway.app](https://railway.app).
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `node server.js`
4. The server will host both the API and the production frontend bundle (`dist/`).

---

## 📁 Project Structure

```text
mahadev-yuvak-mandal/
├── data/
│   └── database.json          # Centralized persistent datastore
├── public/                    # Static assets & icons
├── src/
│   ├── components/
│   │   ├── AddMemberModal.jsx         # Manual & bulk member management
│   │   ├── AutoReminderQueueModal.jsx # 1-click personal reminder queue
│   │   ├── ExpensesTracker.jsx        # Mandal expense management & balance
│   │   ├── Header.jsx                 # Navbar with actions & self-join
│   │   ├── MemberPassbookView.jsx     # Individual member passbook ledger
│   │   ├── MembersMatrix.jsx          # 12-Month donation tracking grid
│   │   ├── MonthlyReminderBanner.jsx  # Notification banner for active month
│   │   ├── PaymentModal.jsx           # Payment collection & multi-month receipts
│   │   ├── SelfJoinModal.jsx          # Public self-registration form
│   │   ├── StatsOverview.jsx          # Collection KPIs & month selector
│   │   ├── UpiSettingsModal.jsx       # Protected UPI QR & Mandal settings
│   │   ├── WhatsAppAutomationModal.jsx# Manual WhatsApp message previews
│   │   └── WhatsAppBotModal.jsx       # Background automated Baileys bot
│   ├── data/
│   │   └── initialData.js             # Initial state, months, & settings
│   ├── utils/
│   │   ├── storage.js                 # Data persistence & backup utilities
│   │   └── whatsapp.js                # Greeting logic & WhatsApp URL formatters
│   ├── App.jsx                        # Root React component & sync state
│   ├── index.css                      # Tailwind CSS v4 styling
│   └── main.jsx                       # React DOM entry point
├── server.js                          # Express API, WhatsApp Bot, & Cron scheduler
├── vercel.json                        # Vercel deployment routing configuration
├── vite.config.js                     # Vite build configuration with API proxy
└── package.json                       # Project scripts and dependencies
```

---

## 👨‍💻 Author & Developer

**Built with dedication by Manthan Kadam**

- **Developer**: Manthan Kadam
- **Mobile**: `9016991020`
- **WhatsApp**: [Click to Chat on WhatsApp](https://wa.me/919016991020?text=Hello%20Manthan,%20I%20saw%20your%20Ganesh%20Mandal%20Portal!)
- **Email**: [mannkadam20@gmail.com](mailto:mannkadam20@gmail.com)
- **GitHub**: [@Manthan-Kadam](https://github.com/Manthan-Kadam)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use and adapt this system for your local mandals, non-profit trusts, and festivals! 🙏
