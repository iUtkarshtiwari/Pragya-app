# Pragya — Task Management & Proctored Coding Contest Platform

Production-grade task management, daily quiz, and proctored coding contest platform designed for college students and administrators.

---

## 🚀 Applications & Services Overview

| Subsystem | Port / Path | Description |
|---|---|---|
| **Admin Web App** | `http://localhost:3000` | Super Admin Dashboard, Live Candidate Proctoring Monitor, Task & Contest Builder |
| **Backend REST API** | `http://localhost:3001` | REST Endpoints, Database Store, Auth, Task State Machine |
| **Real-Time WebSockets** | `ws://localhost:3001/ws/proctoring` | WebSockets live telemetry streaming |
| **Exam Web App** | `http://localhost:3002` | Proctored Exam Engine, WebRTC Camera preview, Server-synced Timer, Monaco Code Editor |
| **Code Runner Sandbox** | `http://localhost:3003` | Isolated Code Execution Microservice (JS, Python, C++, Java) |
| **React Native CLI App** | `apps/mobile` | Mobile App with Device Registration Auth model, Keychain/Keystore, Animated Tasks |
| **Background Worker** | `services/worker` | Idempotent background job worker (Reminders, Overdue sweeps, Auto-submits) |

---

## 🛠️ Quick Start & Setup

### 1. Install Dependencies & Build Packages
```bash
npm install
```

### 2. Run Core API Server
```bash
npm run dev:api
```

### 3. Run Admin Web Application
```bash
npm run dev:admin
```

### 4. Run Exam & Proctoring Web Application
```bash
npm run dev:exam
```

### 5. Run Background Job Worker
```bash
npm run dev:worker
```

### 6. Run Automated Unit & Integration Tests
```bash
npm --prefix services/api test
```

---

## 🔑 Key Architectural Principles
1. **Device Registration Auth Model**: React Native Mobile app does NOT use passwords; uses hardware-bound Keychain/Keystore device session credentials.
2. **Server-Authoritative Timing**: 5-Minute start window and exam duration enforced strictly on the server (`current_server_time < expires_at`).
3. **Defense-In-Depth Proctoring**: WebRTC camera stream monitoring, tab-switch detection, copy-paste trapping, DevTools heuristic signals, and automated risk scoring (`NORMAL`, `REVIEW`, `SUSPICIOUS`, `HIGH_RISK`).
4. **Timezone-Aware Reminders**: Stored in UTC on the server; converted dynamically to current device timezone.
