# Conference Task Manager

A mobile-first React application for viewing and managing team tasks at conferences and events. Features password protection, advanced filtering, URL-based bookmarking, and real-time data from Google Sheets.

## Features

- **Password Protection**: Simple authentication with localStorage persistence
- **Mobile-First Design**: Optimized for smartphones, tablets, and desktop
- **Advanced Filtering**: Filter by day, location, team, person, or search text
- **URL-Based Bookmarks**: Share and bookmark specific filtered views
- **Real-Time Data**: Fetches tasks directly from Google Sheets CSV export
- **Time-Aware Views**: Tasks grouped by "Now", "Next", "Upcoming", and "Past"
- **Team Directory**: People and locations directory with contact info
- **Customizable**: Easy configuration for your event's dates, teams, and branding
- **Demo Mode**: Test locally with example data, no Google Sheets required

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - URL routing and parameters
- **PapaParse** - CSV parsing
- **Vercel** - Hosting and deployment

## Prerequisites

- Node.js 18+ and yarn
- Google Sheets with public access (optional - demo mode works without it)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/conference-task-manager.git
cd conference-task-manager
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

The default `.env.example` has demo mode enabled with password `demo`. To use Google Sheets instead, edit `.env`:

```env
# Required
VITE_APP_PASSWORD=your-secure-password

# Demo Mode - set to 'true' to use example data from public/examples/
VITE_DEMO_MODE=false

# Google Sheets URLs (required when VITE_DEMO_MODE is false)
VITE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
VITE_LOCATIONS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=YOUR_LOCATIONS_GID
VITE_PEOPLE_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=YOUR_PEOPLE_GID

# Optional branding
VITE_APP_TITLE=My Conference Tasks
VITE_APP_SUBTITLE=Conference Name 2025
```

### 4. Configure Your Event

Edit `src/config.js` to set:
- **Event dates** (update the `eventDates` object)
- **Team colors** (customize the `teamColors` mapping)
- **Timezone** (set `timezoneOffset` for your location)

### 5. Start Development Server

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

### Event Dates

Edit `src/config.js` to set your event dates:

```javascript
eventDates: {
  'Thursday': { year: 2025, month: 10, day: 13 },  // month is 0-indexed
  'Friday': { year: 2025, month: 10, day: 14 },
  'Saturday': { year: 2025, month: 10, day: 15 },
  'Sunday': { year: 2025, month: 10, day: 16 }
}
```

### Team Colors

Customize team badge colors in `src/config.js`:

```javascript
teamColors: {
  'Logistics': 'bg-indigo-100 text-indigo-700',
  'Events': 'bg-purple-100 text-purple-700',
  'Communications': 'bg-teal-100 text-teal-700',
  // Add your teams...
}
```

### Branding Colors

Edit `tailwind.config.js` to customize the primary brand color:

```javascript
colors: {
  'brand': {
    50: '#fef7f6',
    // ... full color palette
    950: '#540c06',  // Primary brand color
  },
}
```

## Google Sheets Setup

See the `public/examples/` folder for sample CSV files you can use as templates:
- [`public/examples/tasks.csv`](./public/examples/tasks.csv) - Sample task schedule
- [`public/examples/people.csv`](./public/examples/people.csv) - Sample team directory
- [`public/examples/locations.csv`](./public/examples/locations.csv) - Sample venue list

### Tasks Sheet

| Day | Start | End | Location | Task | Team | Lead | Support 1 | Support 2 | Support 3 | Support 4 | Support 5 | Notes |
|-----|-------|-----|----------|------|------|------|-----------|-----------|-----------|-----------|-----------|-------|
| Thursday | 8:00 AM | 10:00 AM | Main Hall | Registration | Staff | John Doe | Jane Smith | | | | | in the lobby |

### People Sheet

| Name | Role | Phone | Email | Team | Contact for? | WhatsApp |
|------|------|-------|-------|------|--------------|----------|
| John Doe | Coordinator | +1234567890 | john@example.com | Staff | Registration | +1234567890 |

### Locations Sheet

| Place | Maps | Instructions/Notes |
|-------|------|-------------------|
| Main Hall | https://maps.google.com/... | Enter through the side door |

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
yarn global add vercel
vercel login
vercel
```

Then add environment variables in Vercel dashboard.

### Option 2: GitHub Integration

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

## Usage

### Views

- **Now**: Time-aware view showing current and upcoming tasks
- **Mine**: Personal tasks (select your name in header)
- **All**: Full task list with filters
- **Directory**: People and locations directory

### Filtering

- **Search**: Free text search
- **Day**: Filter by day
- **Location**: Filter by venue
- **Team**: Filter by team
- **Person**: Filter by assigned person

Filters update the URL for easy sharing and bookmarking.

## Troubleshooting

### "Failed to fetch CSV"
- Check Google Sheet is publicly accessible
- Verify Sheet ID and GID in URL
- Test URL directly in browser

### "No tasks found"
- Clear all filters
- Check Google Sheet has data
- Click refresh button

### Password not accepted
- Check `.env` has correct `VITE_APP_PASSWORD`
- Restart dev server after changing `.env`

## Security

Simple password protection suitable for internal team use:
- Single shared password
- localStorage authentication
- HTTPS via Vercel

**Not suitable for**: Public applications, sensitive data, individual user auth.

## License

MIT License - see [LICENSE](./LICENSE) file.

## Author

Developed by [Alexander Dietz](https://github.com/alex-dietz)

## Contributing

Contributions welcome! Please keep the app focused and simple.
