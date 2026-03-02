<p align="center">
  <h1 align="center">🌟 Aura</h1>
  <p align="center">
    <strong>Your All-in-One Productivity, Health & Expense Tracker</strong>
  </p>
  <p align="center">
    Built with React Native & Expo — Made with ❤️
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Local%20DB-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## 📖 About

**Aura** is a beautifully designed, feature-rich mobile application that combines health tracking, task management, and expense monitoring into a single, cohesive experience. It runs entirely offline with a local SQLite database — your data stays on your device.

Whether you want to count your steps, manage your to-do list with a Pomodoro timer, track daily expenses, or monitor your sleep quality — Aura has you covered.

---

## ✨ Features

### 🏠 Smart Dashboard
- Personalized greeting with time-based messages (Good Morning/Afternoon/Evening)
- AI-powered motivational messages based on your daily progress
- Real-time overview cards with circular progress indicators for:
  - 🚶 Steps walked today
  - 💧 Water intake
  - ✅ Tasks completed
  - 💰 Daily expenses
- Weekly step trend mini-chart
- Animated UI with smooth fade-in transitions
- Lottie animations for a premium feel

### ✅ Task Management
- **Full CRUD** — Add, edit, complete, and delete tasks
- **Priority levels** — High 🔴, Medium 🟡, Low 🟢 with color-coded badges
- **Swipe gestures** — Swipe right to edit, swipe left to delete
- **Pomodoro Timer** — Built-in focus timer with 4 modes:
  - Work (25 min)
  - Short Break (5 min)
  - Long Break (15 min)
  - Custom duration
- Haptic feedback on timer events
- Session tracking with automatic logging to the database

### 💚 Wellness Tracking
- **Step Counter** — Real-time pedometer integration using device sensors
  - Beautiful circular progress ring
  - Configurable daily step goal
- **Water Intake Logger** — Track your hydration with quick-add buttons (+100ml, +250ml, +500ml)
  - Water bottle fill animation
  - Goal progress tracking
- **Sleep Logger** — Log sleep duration and quality
  - Star-based quality rating (1–5 ⭐)
  - Today's sleep summary
- Weekly wellness charts (Steps & Water) with beautiful line/bar graphs

### 💰 Expense Tracker
- Log daily expenses with categories:
  - 🍔 Food, 🚗 Transport, 📄 Bills, 🛍️ Shopping, 🎮 Entertainment, ⋯ Other
- Weekly spending bar chart
- Monthly total overview
- Search/filter transactions
- Configurable daily & monthly spending limits with **over-budget warnings**
- Multi-currency support (set in Profile)

### 📊 Stats & Analytics
- **Weekly Steps Chart** — Line chart showing your step activity for the week
- **Weekly Tasks Chart** — Bar chart of completed tasks per day
- Navigate between weeks (Previous / Next)
- Beautiful, data-driven visualizations

### 👤 Profile & Settings
- Editable profile with photo picker (camera roll integration)
- Personal details:
  - Name, Email, Date of Birth (calendar picker)
  - Height (supports both **cm** and **feet/inches**)
  - Weight (kg) with automatic **BMI calculation** and health category
- Health goals configuration (step goal, water goal)
- Finance settings (currency, daily/monthly limits)
- **Instant Theme Switching** — Toggle between Dark 🌙 and Light ☀️ mode with a single tap (no restart needed!)
- Sign out functionality

### 🎨 Theming
- **Dark Mode** — Sleek, eye-friendly dark palette with neon accent colors
- **Light Mode** — Vibrant, modern palette with indigo & emerald accents
- Themes apply instantly across all screens without restarting
- Dynamic StatusBar that adapts to the active theme
- All components use reactive theme colors via React Native Paper's `useTheme()`

### 🔐 Authentication
- Local user accounts with email & password
- Password hashing for security
- Persistent sessions via AsyncStorage
- Supports both email and phone number formats
- Sign up with customizable health goals

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **UI Library** | React Native Paper (Material Design 3) |
| **Navigation** | React Navigation (Bottom Tabs + Native Stack) |
| **Database** | Expo SQLite (local, offline-first) |
| **State Management** | React Context API (AuthContext + AppContext) |
| **Charts** | react-native-chart-kit + react-native-svg |
| **Animations** | Lottie, React Native Animated API |
| **Sensors** | Expo Sensors (Pedometer) |
| **Haptics** | Expo Haptics |
| **Image Picker** | Expo Image Picker |
| **Date Picker** | @react-native-community/datetimepicker |
| **Storage** | AsyncStorage (session persistence) |

---

## 📁 Project Structure

```
Aura/
├── src/
│   ├── App.js                    # Root component with ThemeWrapper
│   ├── components/
│   │   ├── OverviewCard.js       # Dashboard metric cards with progress rings
│   │   ├── PomodoroTimer.js      # Focus timer with multiple modes
│   │   ├── TodoItem.js           # Swipeable task item with priority badges
│   │   ├── StepCounter.js        # Pedometer-powered step tracker
│   │   ├── WaterIntake.js        # Hydration tracker with quick-add
│   │   └── SleepLogger.js        # Sleep duration & quality logger
│   ├── context/
│   │   ├── AuthContext.js        # Authentication & theme state
│   │   └── AppContext.js         # App-wide state (dashboard data)
│   ├── database/
│   │   └── Database.js           # SQLite operations (users, steps, todos, expenses, etc.)
│   ├── navigation/
│   │   └── AppNavigator.js       # Tab navigator + auth stack
│   ├── screens/
│   │   ├── DashboardScreen.js    # Home screen with overview
│   │   ├── TasksScreen.js        # Todos + Pomodoro
│   │   ├── WellnessScreen.js     # Health tracking hub
│   │   ├── ExpensesScreen.js     # Expense management
│   │   ├── StatsScreen.js        # Weekly analytics
│   │   ├── ProfileScreen.js      # User settings & preferences
│   │   ├── LoginScreen.js        # Sign in
│   │   └── SignUpScreen.js       # Registration
│   ├── theme/
│   │   └── theme.js              # Dark & Light theme definitions
│   └── utils/
│       └── helpers.js            # Utility functions
├── assets/                       # App icons, splash screen
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your phone (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anishvish/Aura-App---Productivity-Health-and-Expense-Tracker.git
   cd Aura-App---Productivity-Health-and-Expense-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS)
   - Or press `a` to open in an Android emulator

### Build APK

To generate an Android APK:

```bash
npx eas build -p android --profile preview
```

> Note: You'll need an [Expo account](https://expo.dev/signup) and EAS CLI configured.

---

## 📱 Screenshots

| Dashboard | Tasks & Pomodoro | Wellness |
|-----------|-----------------|----------|
| Smart overview with progress rings | Todo list with swipe actions | Step counter, water & sleep tracking |

| Expenses | Stats | Profile |
|----------|-------|---------|
| Category-based expense logging | Weekly step & task charts | Theme toggle, BMI, settings |

---

## 🔑 Key Design Decisions

- **Offline-First Architecture** — All data is stored locally in SQLite. No internet connection required.
- **Instant Theme Switching** — Theme updates propagate instantly through React Context + `useTheme()` without app restart.
- **Component-Scoped Styles** — All stylesheets are generated dynamically via `getStyles(Colors)` to support reactive theming.
- **Privacy-First** — No data leaves your device. No analytics, no cloud sync, no tracking.

---

## 🛣️ Roadmap

- [ ] Cloud sync with optional backup
- [ ] Weekly/monthly reports with PDF export
- [ ] Habit tracker module
- [ ] Meal/nutrition logging
- [ ] Widget support for Android home screen
- [ ] iOS Health Kit integration
- [ ] Notifications & reminders

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Aura</strong> — Track your health, boost your productivity, manage your money.<br/>
  Built with ❤️ using React Native & Expo
</p>
