# MindSlove & CalendarApp

A dual-project repository that combines:

- **MindSlove**: a real-time multiplayer trivia game (single-player, local split-screen, and online room-based play).
- **CalendarApp**: an Android scheduling app for managing departments, tracking arrangements, and triggering reminder notifications.

The repository is ideal for experimenting with real-time web sockets, lightweight game mechanics, and Android local data + notification workflows in one place.

## Features

### MindSlove (Web)
- Single-player trivia mode with per-question timer.
- Offline/local 2-player split-screen mode with keyboard controls.
- Online multiplayer with room creation and room join flow.
- Real-time timer synchronization and score tracking with Socket.IO.
- Post-game answer summary for single-player sessions.
- Graceful handling when trivia questions cannot be fetched.

### CalendarApp (Android)
- Department management with local persistence.
- Date-based arrangement listing via `CalendarView`.
- Add arrangements linked to departments.
- Local reminder scheduling via `AlarmManager`.
- Notification channel initialization and reminder delivery.

## Technology Stack

### Web App
- **Node.js**
- **Express** (static hosting + backend endpoints/events)
- **Socket.IO** (real-time communication)
- **Axios** (external trivia API requests)
- **HTML5 / CSS3 / Vanilla JavaScript**

### Android App
- **Java**
- **Android SDK (API 31 target)**
- **AndroidX AppCompat + Material Components + ConstraintLayout**
- **Gson** (JSON serialization for local SharedPreferences data)

## Project Structure

```text
.
├── index.html            # MindSlove UI entry point
├── style.css             # MindSlove styles
├── script.js             # MindSlove client logic
├── server.js             # Express + Socket.IO trivia backend
├── package.json          # Node dependencies/scripts
├── app/                  # Android application module
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/calendarapp/
│       └── res/
├── build.gradle          # Android top-level Gradle config
└── settings.gradle       # Android project settings
```

## Installation & Setup

## 1) MindSlove (Web)

### Prerequisites
- Node.js 16+ (recommended)
- npm

### Install dependencies
```bash
npm install
```

### Start the server
```bash
npm start
```

### Open in browser
Visit:

```text
http://localhost:3000
```

## 2) CalendarApp (Android)

### Prerequisites
- Android Studio (latest stable recommended)
- Android SDK for API 31
- JDK compatible with your Android Gradle Plugin

### Setup
1. Open this repository in Android Studio.
2. Let Gradle sync complete.
3. Select an emulator/device.
4. Run the `app` configuration.

## Usage Guide

### MindSlove
1. Enter a trivia topic and choose difficulty.
2. Pick a mode:
   - **Tek Kişilik**: single-player quiz.
   - **Çevrimdışı Çok Kişilik**: local split-screen game (Player 1 uses `Q/W/E/R`, Player 2 uses `1/2/3/4`).
   - **Oda Oluştur**: create an online room and share code.
3. For joining online rooms, enter code and click **Odaya Katıl**.
4. Review results at the end and replay.

### CalendarApp
1. Open **Manage Departments** to add department names.
2. Open **Manage Calendar** and select a date.
3. Tap **Add Arrangement**, enter title, select department, and save.
4. Arrangements are filtered by selected date and reminders are scheduled.

## Stability & Quality Improvements Included

This repository now includes fixes for multiple reliability and best-practice issues:

- Fixed invalid Android XML attribute in `activity_calendar.xml`.
- Added defensive checks for empty question payloads and invalid room state in multiplayer backend.
- Prevented duplicate/invalid room joins and enforced minimum player count before online game start.
- Added safer `PendingIntent` flag handling for modern Android versions.
- Added null-safety around notification channel manager and department selection.
- Added Android 13+ notification permission awareness and receiver export hardening.
- Fixed split-screen replay button behavior so both replay buttons work consistently.

## Scripts

- `npm start` — Starts the Node/Express + Socket.IO server.

## Notes

- Online trivia questions are fetched from `the-trivia-api.com`; internet access is required.
- Android reminder behavior may vary depending on device battery optimization policies.

## License

No license file is currently defined in this repository. Add a `LICENSE` file if you plan to distribute this project.
