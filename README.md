# Friendship Keeper 🤝

A beautiful, privacy-focused web application to help you maintain and strengthen your personal relationships through smart reminders and interaction tracking.

## ✨ Features

### 📱 Friend Management
- Add, edit, and organize your friends with photos and relationship types
- Track contact preferences (how often you want to stay in touch)
- Store personal notes and memories

### 📅 Smart Reminders
- Color-coded urgency system (Red: Overdue, Yellow: Due Soon, Green: Safe)
- Customizable contact frequency windows (e.g., every 14-30 days)
- Monthly calendar view with visual reminder indicators
- Motivational messages to encourage staying connected

### 📊 Interaction Tracking
- Log calls, texts, visits, and other types of contact
- Automatic "last contact" timestamp updates
- Weekly and monthly interaction statistics
- Streak tracking for consistent connections

### 🏆 Gamification
- Achievement badges for milestones
- Progress tracking (First Friend, Social Butterfly, Week Warrior, etc.)
- At-risk friendship detection

### 🔔 Notifications
- Browser push notifications for overdue reminders
- Service Worker integration for offline support

### 🔒 Privacy-First
- **100% client-side storage** using LocalStorage
- No backend servers or databases
- All data stays on your device
- Export/import functionality for data portability

### 🎨 Modern UI/UX
- Dark mode support
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Coral & Teal color palette

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and Yarn installed

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/friendship-keeper.git
cd friendship-keeper

# Install dependencies
yarn install

# Run the development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Create an optimized production build
yarn build

# Start the production server
yarn start
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Date Handling:** date-fns
- **Storage:** Browser LocalStorage
- **Notifications:** Service Workers API

## 📁 Project Structure

```
friendship-keeper/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── settings/
│   │   └── page.tsx          # Settings page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── friend-card.tsx       # Friend display component
│   ├── friend-modal.tsx      # Add/edit friend form
│   ├── interaction-modal.tsx # Log interaction form
│   ├── calendar-view.tsx     # Monthly calendar
│   ├── stats-cards.tsx       # Dashboard statistics
│   ├── badges-display.tsx    # Achievement system
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── storage.ts            # LocalStorage management
│   ├── reminder-utils.ts     # Reminder logic & calculations
│   ├── notifications.ts      # Notification system
│   └── types.ts              # TypeScript definitions
└── public/
    ├── sw.js                 # Service Worker
    └── favicon.svg           # App icon
```

## 🎯 Usage Guide

### Adding a Friend
1. Click the "+ Add Friend" button on the dashboard
2. Enter their name, upload a photo (optional), and select relationship type
3. Set your preferred contact frequency (e.g., check in every 14-30 days)
4. Add notes to remember important details

### Logging Interactions
1. Click "Log Interaction" on any friend card
2. Select the type of contact (call, text, visit, etc.)
3. Choose the date and add optional notes
4. Your reminder window automatically resets

### Managing Settings
1. Navigate to Settings from the dashboard
2. Toggle dark mode, set default frequencies
3. Enable browser notifications for reminders
4. Export your data for backup or import previous data

## 📱 Mobile App (PWA)

Friendship Keeper works as a Progressive Web App:
- Install it on your phone from your browser
- Works offline after first load
- Receives push notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 💡 Roadmap

- [ ] Multi-device sync (optional cloud backup)
- [ ] Recurring event reminders (birthdays, anniversaries)
- [ ] Group tracking for friend circles
- [ ] Export to calendar apps (iCal format)
- [ ] Advanced analytics and insights

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

**Made with ❤️ for meaningful connections**