# Sportigon - Live Sports Scores Platform

A professional sports live score application inspired by LiveScore.com, built with React, TypeScript, Supabase, and Tailwind CSS.

![Sportigon Banner](https://img.shields.io/badge/Sportigon-Live%20Scores-00A859?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Live Scores**: Watch matches update live with WebSocket subscriptions
- **6 Sports Supported**: Football, Basketball, Tennis, Cricket, Baseball, and Hockey
- **Smart Filtering**: Filter by sport, league, and date
- **Match States**: Live, scheduled, and finished matches with visual indicators
- **League Standings**: Complete league tables with statistics and color-coded positions

### 🎨 UI/UX Highlights
- **LiveScore-inspired Design**: Professional, clean interface with brand colors
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Real-time Indicators**: Pulsing live badges for ongoing matches
- **Interactive Cards**: Click-ready match cards for future detail pages

### ⚡ Technical Features
- TypeScript for type safety
- Supabase real-time subscriptions
- Mock data fallback system
- SEO-optimized with meta tags
- Google Fonts integration (Inter)
- Custom Tailwind CSS theme

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- (Optional) Supabase account for real database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd startup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   
   Copy the example env file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   > **Note**: The app works with mock data even without Supabase credentials!

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
sportigon/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── SportsTabs.tsx  # Sport selection tabs
│   │   └── MatchCard.tsx   # Match display card
│   ├── pages/              # Main page components
│   │   ├── LiveScores.tsx  # Live scores page
│   │   └── Standings.tsx   # League standings page
│   ├── store/              # State management
│   │   └── matchStore.ts   # Zustand store
│   ├── lib/                # Utilities and services
│   │   └── supabase.ts     # Supabase client & types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🎮 Usage

### Viewing Live Scores
1. Select a sport from the tabs (Football, Basketball, etc.)
2. Use the date navigation to browse fixtures
3. Filter by specific leagues using the dropdown
4. Click on match cards to view details (coming soon!)

### Viewing Standings
1. Navigate to the "Standings" page
2. View league tables with:
   - Team positions
   - Matches played, won, drawn, lost
   - Goals for/against and goal difference
   - Total points
   - Color-coded qualification zones

## 🗄️ Database Setup (Optional)

If you want to use Supabase for real-time data:

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com)

2. Run the migrations in your Supabase SQL editor:
   - `supabase/migrations/20251029101918_create_users_and_posts_schema.sql`
   - `supabase/migrations/20251030085941_create_matches_and_standings_schema.sql`
   - `supabase/migrations/20260128000000_enhanced_sample_data.sql`

3. Get your credentials from Project Settings → API

4. Add them to your `.env` file

## 🎨 Color Palette

- **Primary Green**: `#00A859` - LiveScore brand color
- **Dark Background**: `#1A1A1A` - Header
- **Gray Tones**: `#2D2D2D`, `#F5F5F5`
- **Status Colors**:
  - 🔴 Red - Live matches
  - 🟢 Green - Finished matches
  - ⚫ Gray - Scheduled matches

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type check
npm run build
```

### Adding New Sports

1. Add sport icon and name to `src/components/SportsTabs.tsx`
2. Add sample data in the database migration or mock data function
3. The app will automatically handle the new sport!

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Zustand | State management |
| Supabase | Database & real-time |
| React Router | Navigation |
| Framer Motion | Animations |
| date-fns | Date formatting |
| Lucide React | Icons |

## 🌟 Features Coming Soon

- [ ] User authentication
- [ ] Favorite teams and matches
- [ ] Push notifications
- [ ] Match detail pages with statistics
- [ ] Live commentary
- [ ] Video highlights
- [ ] Social features (predictions, comments)
- [ ] Dark mode toggle
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [LiveScore.com](https://www.livescore.com)
- Built with modern web technologies
- Designed for sports fans worldwide

---

**Made with ❤️ for sports enthusiasts**

For questions or support, please open an issue on GitHub.
