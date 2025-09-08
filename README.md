# Dia-Hub 🩺
*Diabetes Supplies Tracker & Management App*

A comprehensive React Native app designed to help people with diabetes manage their supplies, track usage, and stay organized with their daily diabetes care routine.

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 📦 Supply Management
- **Inventory Tracking** - Add, edit, and monitor diabetes supplies
- **Categories** - Insulin, CGM/Sensors, Test Strips, Lancets, Needles, Infusion Sets, Pump supplies
- **Low Stock Alerts** - Customizable warning thresholds
- **Expiration Monitoring** - Track expiration dates and get warnings

### 📱 Active Usage Tracking
- **Start Using Items** - Track when you begin using insulin vials, CGM sensors, pump supplies
- **Real-time Timers** - Countdown for device replacements (CGM, infusion sets)
- **Insulin Volume Tracking** - Monitor remaining insulin in active vials
- **Grace Period Handling** - Extended time for device changes

### 🔔 Smart Notifications
- **Low Stock Alerts** - Get notified when supplies run low
- **Expiration Warnings** - Advanced notice for expiring supplies  
- **Device Reminders** - CGM and infusion set replacement notifications
- **Intelligent System** - No spam, notifications sent only once per condition

### 📊 Activity History
- **Complete Logging** - Track all supply additions, usage, and changes
- **Visual Timeline** - Color-coded events with timestamps
- **Search & Filter** - Find specific activities quickly
- **Usage Patterns** - Understand your diabetes management trends

### 🎨 User Experience
- **Dark/Light Themes** - Automatic or manual theme switching
- **Intuitive Navigation** - Clean tabbed interface
- **Offline-First** - All data stored locally on device
- **Privacy-Focused** - No cloud sync, complete data control

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RNDMJUNKLLC/rork-dia-hub.git
   cd rork-dia-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   ```

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand with React Context
- **Storage**: AsyncStorage
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Lucide React Native
- **Notifications**: Expo Notifications

## 🏗️ Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── index.tsx        # Supplies inventory
│   ├── in-use.tsx       # Active items tracking
│   ├── history.tsx      # Activity history
│   └── settings.tsx     # App settings
├── _layout.tsx          # Root layout
components/              # Reusable UI components
├── SupplyCard.tsx       # Supply item display
├── AddSupplyModal.tsx   # Add/edit supply modal
├── StartUsingModal.tsx  # Start using item modal
└── ...
hooks/                   # Custom hooks & services
├── supplies-store.ts    # Main state management
├── notifications.ts     # Notification service
├── history-store.ts     # Activity logging
└── theme-store.ts       # Theme management
types/                   # TypeScript type definitions
├── supplies.ts          # Supply-related types
└── history.ts           # History event types
```

## 🎯 Target Audience

This app is designed for people with diabetes who use:
- 💉 Insulin (any type)
- 📊 Continuous Glucose Monitors (CGM)
- ⚙️ Insulin pumps and infusion sets
- 🩸 Blood glucose testing supplies
- 💊 Injectable diabetes medications

## 🔒 Privacy & Security

- **Local Storage Only** - All data stays on your device
- **No Account Required** - Use immediately without registration
- **No Cloud Sync** - Complete control over your health data
- **Open Source** - Transparent code you can review

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/RNDMJUNKLLC/rork-dia-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RNDMJUNKLLC/rork-dia-hub/discussions)

## 🗺️ Roadmap

- [ ] Enhanced reporting and analytics
- [ ] Data export for healthcare providers
- [ ] Health app integrations
- [ ] Advanced pattern recognition
- [ ] Medication reminder expansions
- [ ] Multi-language support

## ⚠️ Disclaimer

Dia-Hub is designed to complement, not replace, professional medical care. Always consult with your healthcare provider for diabetes management decisions.

---

**Built with ❤️ for the diabetes community**

*Created by [RNDM JUNK LLC](https://github.com/RNDMJUNKLLC)*
