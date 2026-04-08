# 📅 Interactive Calendar

A modern, feature-rich calendar application built with Next.js, React, and TypeScript. Track moods, manage notes, customize themes, and explore beautiful calendar dates with smooth animations and an elegant user interface.

## ✨ Features

### Core Calendar Features

- **Interactive Date Selection** – Click to select single dates or drag to select date ranges
- **Mood Tracking** – Tag dates with moods: focused, chill, energetic, or reflective
- **Notes Management** – Add and manage notes for individual dates or date ranges
- **Month Navigation** – Seamlessly navigate between months
- **Special Days** – Highlights notable days and events

### User Experience

- **Dark/Light Mode** – Automatic theme detection with manual override
- **Multiple Themes** – Choose from 5 vibrant color themes: blue, warm, cool, neutral, and vibrant
- **Smooth Animations** – Page-turn transitions and motion effects powered by Framer Motion
- **Parallax Effects** – 3D tilt interactions on the hero section
- **Search & Filter** – Find dates and notes quickly
- **Responsive Design** – Beautiful on desktop, tablet, and mobile devices

### Data Management

- **Export Data** – Download calendar data for backup or external processing
- **Import Data** – Restore calendar states from exported files
- **Persistent Storage** – All data saved locally in the browser
- **Auto-Save** – Changes are automatically persisted

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd calendar

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app will hot-reload as you make changes to files.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
calendar/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── src/
│   ├── components/
│   │   └── Calendar/            # Calendar component suite
│   │       ├── Calendar.tsx     # Main calendar component
│   │       ├── CalendarGrid.tsx # Calendar grid layout
│   │       ├── HeroSection.tsx  # Hero banner with parallax
│   │       └── NotesSection.tsx # Notes display area
│   ├── hooks/
│   │   └── useCalendarState.ts  # Calendar state management
│   ├── lib/
│   │   ├── constants.ts         # Theme colors, hero images
│   │   └── dateUtils.ts         # Date utility functions
│   └── types/
│       └── calendar.ts          # TypeScript type definitions
├── public/                       # Static assets
│   └── images/
│       └── hero/                # Hero section images
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
├── postcss.config.mjs
└── eslint.config.mjs
```

## 🛠️ Technologies

- **[Next.js 16](https://nextjs.org/)** – React framework with Server Components support
- **[React 19](https://react.dev/)** – UI library with new hooks and features
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** – Animation library
- **[date-fns](https://date-fns.org/)** – Modern date utility library
- **[Lucide React](https://lucide.dev/)** – Beautiful icon library
- **[React Parallax Tilt](https://www.npmjs.com/package/react-parallax-tilt)** – 3D tilt effect
- **[clsx](https://github.com/lukeed/clsx)** – Conditional className utility

## 🎨 Customization

### Theme Colors

Change the theme by selecting one of 5 built-in color schemes:

- **Blue** – Professional and calm
- **Warm** – Friendly and energetic
- **Cool** – Modern and sleek
- **Neutral** – Minimalist
- **Vibrant** – Bold and playful

### Adding Custom Dates

Edit `src/lib/constants.ts` to add special dates and holidays that will be highlighted in the calendar.

### Hero Images

Add new hero images to `public/images/hero/` and update the image list in `src/lib/constants.ts`.

## 📝 State Management

The calendar uses React hooks for state management:

- `useCalendarState()` – Manages all calendar-related state
- `useSyncExternalStore()` – Handles browser storage synchronization
- `useStoredAppearanceMode()` – Manages dark/light theme preference

State is automatically persisted to browser localStorage.

## ⌨️ Keyboard Shortcuts

- **Arrow Keys** – Navigate between dates
- **Enter** – Select/deselect dates
- **Ctrl+Z / Cmd+Z** – Undo (if implemented)

## 🐛 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs/) – Learn about Next.js features
- [React Documentation](https://react.dev/) – React fundamentals and hooks
- [Tailwind CSS](https://tailwindcss.com/docs) – Styling utilities
- [Framer Motion](https://www.framer.com/motion/documentation/) – Animation docs

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository or contact the development team.

---

**Made with ❤️ using Next.js and React**
