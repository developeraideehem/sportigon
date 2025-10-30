# Sportigon - Live Sports Scores Platform

A sophisticated sports live score application inspired by LiveScore.com, built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Real-time Live Scores**: Watch matches update in real-time with live indicators
- **Multiple Sports**: Football, Basketball, Tennis, Cricket, Baseball, and Hockey
- **Match Cards**: Beautiful match displays with team names, scores, and match status
- **Standings Table**: Complete league standings with positions, points, and statistics
- **League Filtering**: Filter matches by specific leagues
- **Date Navigation**: Browse matches by date with easy navigation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **LiveScore-inspired UI**: Clean, professional design matching industry standards

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom LiveScore color scheme
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Database Schema

The application uses Supabase with the following tables:

- **matches**: Stores match data including teams, scores, status, and timing
- **standings**: League standings with team statistics and positions

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Features Overview

### Live Scores Page
- Real-time match updates
- Live, finished, and upcoming matches grouped separately
- Live indicator with pulsing animation
- Match minute display for live games
- Stadium information

### Standings Page
- Complete league table
- Color-coded positions (Champions League, Europa League, Relegation)
- Goals for/against and goal difference
- Points and form tracking

### Navigation
- Sports tabs for quick sport switching
- Search functionality
- Notifications and user profile access
- Date picker for browsing fixtures

## Color Scheme

- Primary Green: `#00A859` (LiveScore green)
- Dark Background: `#1A1A1A`
- Gray Accents: `#2D2D2D`
- Light Gray: `#F5F5F5`

## Development

The app is structured as follows:
- `/src/components`: Reusable UI components
- `/src/pages`: Main page components
- `/src/store`: Zustand state management
- `/src/lib`: Supabase client and utilities

## License

MIT
