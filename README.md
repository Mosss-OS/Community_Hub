# 🏛️ WCCRM Lagos - Resource Management

A modern, comprehensive church resource management system built with React, Express.js, and PostgreSQL. Specifically designed for Watchman Catholic Charismatic Renewal Movement Lagos to strengthen 
connections through seamless digital experiences.

> **Watchman Catholic Charismatic Renewal Movement, Lagos**: This is a comprehensive church resource management platform developed specifically for Watchman Catholic Charismatic Renewal Movement, Lagos.

![WCCRM Lagos Banner](https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=400&fit=crop&q=80)

## ✨ Features Overview

### 🎥 **Sermon Management**
- Video and audio sermon streaming
- Sermon series organization
- Speaker profiles and search
- Thumbnail management
- Download capabilities

### 📅 **Event Management**
- Community event calendar
- RSVP functionality
- Event categories and filtering
- Image galleries
- Location mapping integration

### 🙏 **Prayer Requests**
- Anonymous and authenticated submissions
- Prayer count tracking
- Community prayer support
- Privacy controls
- Request categorization

### 💰 **Giving & Donations**
- Secure online giving platform
- Multiple payment methods
- Donation history tracking
- Recurring giving options
- Tax receipt generation

### 👥 **User Authentication**
- Secure user registration/login
- Role-based access control
- Profile management
- Session management
- OAuth integration

### 🎨 **Customizable Branding**
- Church-specific color schemes
- Logo and image management
- Font customization
- Theme switching
- White-label solution

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Vite** - Fast build tool
- **React Query** - Server state management
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe server code
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Robust database system
- **Express Session** - Session management

### Development & Deployment
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing
- **Vercel** - Deployment platform

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone git@github.com:Moses-main/WCCRM_Lagos.git
cd WCCRM_Lagos
```

> **Note**: You're cloning the Watchman Catholic Charismatic Renewal Movement Lagos Church Resource Management platform.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Use environment-specific files in the project root. The server automatically loads the file matching `NODE_ENV`:

- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

You can copy from `.env.example` and update values per environment.

```bash
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
```

Root environment template:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
SESSION_SECRET=your_secure_session_secret
JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:5000
CLIENT_API_URL=http://localhost:5000/api

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_WEBSOCKETS=true
ENABLE_ANALYTICS=false

# Optional: Object Storage
PUBLIC_OBJECT_SEARCH_PATHS=path1,path2
PRIVATE_OBJECT_DIR=your_private_directory
```

Client environment files live in `client/.env.development`, `client/.env.staging`, and `client/.env.production` and define:

- `VITE_API_URL` / `VITE_API_BASE_URL` for environment-specific API URLs
- `VITE_WS_URL` for realtime socket URL
- `VITE_FEATURE_NOTIFICATIONS`, `VITE_FEATURE_WEBSOCKETS`, `VITE_FEATURE_ANALYTICS` for frontend feature flags

### 4. Database Setup
```bash
# Create database tables
node setup-db.js

# Or use Drizzle migrations
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5000` to access the application.

## 📖 Usage Guide

### For Church Administrators
1. **Setup Branding**: Customize colors, fonts, and logos
2. **Add Content**: Upload sermons, create events
3. **Manage Users**: Configure roles and permissions
4. **Monitor Analytics**: Track engagement and donations

### For Community Members
1. **Browse Content**: Watch sermons, view events
2. **Participate**: RSVP to events, submit prayer requests
3. **Give**: Make secure donations online
4. **Connect**: Engage with community features

## 🏗️ Project Structure

```
WCCRM_Lagos/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── index.css      # Global styles
│   └── index.html         # HTML template
│
├── server/                # Express Backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── db.ts             # Database configuration
│   └── storage.ts        # Data access layer
│
├── shared/               # Shared TypeScript types
│   ├── schema.ts        # Database schema
│   └── routes.ts        # API route definitions
│
├── setup-db.js         # Database initialization
└── package.json        # Dependencies & scripts
```

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run check     # TypeScript type checking
npm run db:push   # Push database schema changes
```

## 🌐 API Endpoints

### Sermons
- `GET /api/sermons` - List all sermons
- `GET /api/sermons/:id` - Get specific sermon
- `POST /api/sermons` - Create new sermon (auth required)

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event (auth required)
- `POST /api/events/:id/rsvp` - RSVP to event (auth required)

### Prayer Requests
- `GET /api/prayer-requests` - List prayer requests
- `POST /api/prayer-requests` - Submit prayer request (auth required)
- `POST /api/prayer-requests/:id/pray` - Increment prayer count

### Donations
- `POST /api/donations` - Process donation

### Branding
- `GET /api/branding` - Get current branding
- `POST /api/branding` - Update branding (auth required)

## 🎨 Customization

### Theming
The platform supports extensive theming through CSS custom properties:

```css
:root {
  --primary: 215 25% 27%;      /* Deep Slate Blue */
  --secondary: 210 40% 96%;    /* Light Gray */
  --accent: 262 83% 58%;       /* Purple Accent */
  /* ... more variables */
}
```

### Branding API
Update church branding programmatically:

```javascript
const branding = {
  colors: {
    primary: "#1e40af",
    secondary: "#f8fafc", 
    accent: "#3b82f6"
  },
  fonts: {
    heading: "Inter",
    body: "Inter"
  },
  logoUrl: "https://example.com/logo.png"
};

await fetch('/api/branding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(branding)
});
```

## 🔐 Security Features

- **SQL Injection Protection** - Parameterized queries with Drizzle ORM
- **XSS Prevention** - Input sanitization and CSP headers
- **CSRF Protection** - Token-based validation
- **Secure Sessions** - HTTP-only cookies with secure flags
- **Environment Variables** - Sensitive data protection
- **Role-Based Access** - Granular permission system

## 🚀 Deployment Options

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Vercel automatically builds and deploys
4. Zero-configuration deployment

### Traditional Hosting
1. Build the application: `npm run build`
2. Serve `dist/` folder with any web server
3. Configure database connection
4. Set up SSL certificate

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose (Production-like)
Run the app and Postgres with:

```bash
docker compose up --build -d
```

This uses:
- `Dockerfile` (multi-stage production build)
- `docker-compose.yml` (app + postgres services)

### Docker Compose (Local Development)
For hot-reload development with mounted source and Postgres:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts:
- app dev server on `http://localhost:5000` (API) and Vite on `http://localhost:5173`
- postgres on `localhost:5432`

## 🤝 Contributing

We welcome contributions to the WCCRM Lagos platform!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

This is Watchman Catholic Charismatic Renewal Movement Lagos' resource management system - all contributions are welcome!

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📊 Performance & Monitoring

### Built-in Optimizations
- Server-side rendering ready
- Image lazy loading
- Code splitting
- Database query optimization
- CDN-ready static assets

### Monitoring Endpoints
- `GET /health` - Application health check
- `GET /api/stats` - Usage statistics
- Performance metrics via console logging

## 💾 Database Backup & Restore

### Create Backup (pg_dump)
Use the scripted backup command:

```bash
DATABASE_URL=postgres://user:pass@host:5432/db npm run db:backup
```

Default behavior:
- writes compressed backups to `./backups`
- keeps last 30 days (`BACKUP_RETENTION_DAYS`)
- writes latest successful run marker to `./backups/latest-success.txt`
- optional failure alert webhook via `BACKUP_ALERT_WEBHOOK`

### Automated Daily Backup (cron)
Install the daily cron entry (2:00 AM):

```bash
bash ./scripts/install-backup-cron.sh
```

Cron source file: `scripts/backup.cron`

### Secure Backup Storage (S3/local)
Backups are stored locally by default. To upload to S3:

```bash
export S3_BACKUP_BUCKET=your-backup-bucket
export S3_BACKUP_PREFIX=community-hub
DATABASE_URL=postgres://user:pass@host:5432/db npm run db:backup
```

Requires AWS CLI credentials with write access to the bucket.

### Restore Procedure
Restore from a `.sql` or `.sql.gz` backup:

```bash
DATABASE_URL=postgres://user:pass@host:5432/db npm run db:restore -- ./backups/community_hub_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Test Restore Readiness
Verify backup dump integrity before restore:

```bash
npm run db:test-restore -- ./backups/community_hub_backup_YYYYMMDD_HHMMSS.sql.gz
```

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
export DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Styling Issues**
```bash
# Rebuild Tailwind CSS
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for church communities worldwide
- Inspired by the need for better digital community tools
- Special thanks to open-source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting guide above
- Review the API documentation

---

**Made with ❤️ by Moses for WCCRM Lagos and church communities seeking to connect, grow, and serve together in the digital age.**

## 📊 Project Status

**🎯 WCCRM Lagos**: This WCCRM platform is specifically designed for Watchman Catholic Charismatic Renewal Movement, Lagos, representing a complete, modern solution for church resource management and community engagement.

---

### 🌟 Features Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Live streaming integration
- [ ] Member directory
- [ ] Small groups management
- [ ] Volunteer scheduling
- [ ] Automated email campaigns
- [ ] Advanced reporting tools
- [ ] Third-party integrations (Zoom, Google Calendar)

### 📈 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced UI/UX and performance improvements
- **v1.2.0** - Advanced authentication and role management
- **v2.0.0** - Complete platform overhaul (current)
