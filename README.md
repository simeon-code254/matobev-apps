# Matobev - AI Football Scout Platform

A comprehensive football scouting platform that uses AI to analyze player performance from videos and generate detailed player cards.

## 🏗️ Architecture

**Packages:**
- `users-app`: Player/Scout app (Vite + React + TypeScript + Tailwind + shadcn/ui)
- `admin-app`: Admin dashboard (password protected)
- `ml-service`: FastAPI microservice for video analysis → Player Cards
- `shared`: Shared UI components, types, and utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/simeon-code254/matobev.git
cd matobev
```

2. **Install dependencies:**
```bash
# Install shared package
cd shared && npm install && cd ..

# Install users-app
cd users-app && npm install && cd ..

# Install admin-app  
cd admin-app && npm install && cd ..

# Install ml-service
cd ml-service && poetry install && cd ..
```

3. **Set up environment variables:**
```bash
# Copy environment templates
cp shared/env-templates/production.env .env.production
# Edit with your actual values
```

4. **Run locally:**
```bash
# Users app
cd users-app && npm run dev

# Admin app (in another terminal)
cd admin-app && npm run dev

# ML service (in another terminal)
cd ml-service && poetry run fastapi dev app/main.py
```

## 🌐 Deployment

### Quick Deploy (30 minutes)
Follow the [QUICK_DEPLOY.md](QUICK_DEPLOY.md) guide for the fastest deployment.

### Full Deployment Guide
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive deployment options.

### Automated Deployment
Run the deployment script:
```bash
# Windows
./deploy.bat

# Mac/Linux
./deploy.sh
```

## 🗄️ Database (Supabase)

**Authentication:**
- Email OTP authentication enabled

**Storage Buckets:**
- `videos`: Authenticated write access
- `thumbnails`: Public read access
- `player-cards`: Public read access
- `avatars`: Public read access

**Tables:**
- `profiles`: User profiles and player information
- `trials`: Trial management
- `news`: News and updates
- `tournaments`: Tournament information
- `messages`: Messaging system
- `uploads`: File upload tracking
- `player_cards`: AI-generated player performance cards
- `video_analysis`: ML analysis results

## 🔒 Security

- **Never expose service role keys to frontend applications**
- All sensitive operations use server-side authentication
- Row Level Security (RLS) enabled on all tables
- CORS properly configured for production domains

## 📱 Features

- **AI Video Analysis**: Upload football videos for AI-powered performance analysis
- **Player Cards**: FIFA-style player cards with detailed statistics
- **Status Updates**: Instagram-style story sharing
- **Trial Management**: Track and manage football trials
- **Messaging System**: Connect with scouts and players
- **Analytics Dashboard**: Track performance over time
- **Admin Panel**: Manage users, content, and system settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment help, see the deployment guides or open an issue on GitHub.
