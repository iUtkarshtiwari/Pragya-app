# Pragya Platform — System Architecture & Security Specification

## 1. Monorepo Subsystems Architecture
- **Admin/Super Admin Web App (`apps/admin-web`)**:
  Built with React + Vite + Custom CSS. Provides real-time candidate live telemetry monitor, multi-student task assigner, daily quiz & contest wizards, security risk level classifier (`NORMAL`, `REVIEW`, `SUSPICIOUS`, `HIGH_RISK`), and availability management.
- **Proctored Exam Web App (`apps/exam-web`)**:
  Built with React + Vite + WebRTC. Features WebRTC video preview stream, server-authoritative timer synchronization, split-pane Monaco code editor, test case runner, hint drawer, and anti-cheating event ingestion (tab switches, focus blur, copy/paste trap, DevTools signals).
- **React Native CLI Mobile App (`apps/mobile`)**:
  No username/password auth; relies on an invitation/device-registration token model. Hardware session credentials stored in iOS Keychain & Android Keystore. Includes an animated dashboard ("Today's Tasks", "Today's Challenge", state machine transitions `NOT_STARTED` -> `IN_PROGRESS` -> `COMPLETED`), and a timezone-aware notification engine.
- **Core Backend API (`services/api`)**:
  Node.js + Express REST & WebSocket server. Handles PostgreSQL persistence, invitation token validation (5-minute start window enforcement), server-authoritative timer ticks, and audit trail logging.
- **Background Worker (`services/worker`)**:
  Idempotent worker for task reminders, overdue task sweeps, notification retries, and exam auto-submits.
- **Code Execution Sandbox (`services/code-runner`)**:
  Isolated execution service enforcing CPU, memory, thread, and network limits for JavaScript, Python, C++, and Java.

## 2. Server-Authoritative Timing & 5-Minute Exam Window
- Exam invitation links are cryptographically signed with a strict 5-minute activation window enforced on the server.
- Upon starting an exam, the server creates `started_at` and `expires_at = started_at + contest.duration`. Client timers only perform UI rendering; the backend auto-submits once `expires_at` is reached.

## 3. Anti-Cheating & Proctoring Detection Model
Browser JavaScript cannot guarantee 100% anti-cheating prevention; therefore, Pragya implements defense-in-depth telemetry:
1. `CAMERA_DISCONNECTED` / `CAMERA_STARTED` via WebRTC stream monitoring.
2. `TAB_SWITCH` & `WINDOW_BLUR` listeners.
3. Clipboard copy/paste trapping.
4. DevTools heuristic signals (`DEVTOOLS_SUSPECTED`).
5. Weighted Risk Scoring (`NORMAL`, `REVIEW`, `SUSPICIOUS`, `HIGH_RISK`) displayed on the Admin Live Monitoring Dashboard.
