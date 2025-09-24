# 🚀 Complete Matobev App Deployment Guide

This guide will walk you through deploying your Matobev football platform to production with all components.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- A domain name (optional but recommended)
- Basic knowledge of command line

## 🏗️ Architecture Overview

Your app consists of:
1. **Frontend**: React app (users-app & admin-app)
2. **Backend**: Supabase (Database + Auth + Storage)
3. **ML Service**: Python FastAPI service
4. **Shared Package**: Common utilities

## 🎯 Deployment Options

### Option 1: Vercel + Supabase + Railway (Recommended)
- **Frontend**: Vercel (Free tier available)
- **Database**: Supabase (Free tier available)
- **ML Service**: Railway (Free tier available)

### Option 2: Netlify + Supabase + Render
- **Frontend**: Netlify (Free tier available)
- **Database**: Supabase (Free tier available)
- **ML Service**: Render (Free tier available)

### Option 3: Self-hosted VPS
- **Everything**: DigitalOcean/AWS/Azure VPS

---

## 🚀 Option 1: Vercel + Supabase + Railway (Recommended)

### Step 1: Prepare Your Code

1. **Clean up sensitive data**:
```bash
# Remove any hardcoded secrets from your code
# Make sure all sensitive data is in environment variables
```

2. **Update environment variables**:
```bash
# Create production environment files
cp shared/env-templates/production.env .env.production
```

3. **Commit your changes**:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy Supabase Database

1. **Go to [Supabase](https://supabase.com)**
2. **Create a new project**:
   - Project name: `matobev-production`
   - Database password: Generate a strong password
   - Region: Choose closest to your users

3. **Run database migrations**:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

4. **Set up storage buckets**:
   - Go to Storage in Supabase dashboard
   - Create bucket: `videos` (public)
   - Create bucket: `thumbnails` (public)
   - Create bucket: `status` (public)

5. **Configure RLS policies**:
   - Go to Authentication > Policies
   - Enable RLS on all tables
   - Apply the policies from your migration files

6. **Get your Supabase credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon key

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure build settings**:

   **For users-app**:
   - Framework Preset: `Vite`
   - Root Directory: `users-app`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

   **For admin-app**:
   - Framework Preset: `Vite`
   - Root Directory: `admin-app`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set environment variables**:
```bash
# Users App Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ML_SERVICE_URL=https://your-ml-service.railway.app
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_secret

# Admin App Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. **Deploy both apps**

### Step 4: Deploy ML Service to Railway

1. **Go to [Railway](https://railway.app)**
2. **Create a new project**
3. **Connect your GitHub repository**
4. **Select the ml-service folder**
5. **Configure environment variables**:
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
REDIS_URL=redis://host:port
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

6. **Deploy the service**

### Step 5: Configure Cloudinary (Optional)

1. **Go to [Cloudinary](https://cloudinary.com)**
2. **Create a new account**
3. **Get your credentials**:
   - Cloud Name
   - API Key
   - API Secret
4. **Add these to your environment variables**

---

## 🌐 Option 2: Netlify + Supabase + Render

### Step 1: Deploy Frontend to Netlify

1. **Go to [Netlify](https://netlify.com)**
2. **Connect your GitHub repository**
3. **Configure build settings**:

   **For users-app**:
   - Base directory: `users-app`
   - Build command: `npm run build`
   - Publish directory: `users-app/dist`

   **For admin-app**:
   - Base directory: `admin-app`
   - Build command: `npm run build`
   - Publish directory: `admin-app/dist`

4. **Set environment variables** (same as Vercel)
5. **Deploy both apps**

### Step 2: Deploy ML Service to Render

1. **Go to [Render](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure settings**:
   - Root Directory: `ml-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Set environment variables** (same as Railway)
6. **Deploy the service**

---

## 🖥️ Option 3: Self-hosted VPS

### Step 1: Set up VPS

1. **Choose a VPS provider** (DigitalOcean, AWS, Azure)
2. **Create a Ubuntu 20.04+ server**
3. **Configure basic security**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Deploy with Docker Compose

1. **Create production docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: matobev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ml-service:
    build: ./ml-service
    ports:
      - "8003:8003"
    environment:
      DATABASE_URL: postgresql://postgres:your_secure_password@postgres:5432/matobev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ml-service

volumes:
  postgres_data:
```

2. **Create nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream ml_service {
        server ml-service:8003;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location /api/ {
            proxy_pass http://ml_service/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

3. **Deploy**:
```bash
# Clone your repository
git clone https://github.com/yourusername/matobev.git
cd matobev

# Build and start services
docker-compose up -d

# Build frontend
cd users-app
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html/

cd ../admin-app
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html/admin/
```

---

## 🔧 Post-Deployment Configuration

### Step 1: Update CORS Settings

1. **In Supabase Dashboard**:
   - Go to Settings > API
   - Add your frontend URLs to CORS origins:
     - `https://your-users-app.vercel.app`
     - `https://your-admin-app.vercel.app`

### Step 2: Configure Domain (Optional)

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **Point DNS to your hosting**:
   - For Vercel: Add CNAME record
   - For Netlify: Add CNAME record
   - For VPS: Add A record

### Step 3: Set up SSL (Automatic with Vercel/Netlify)

For VPS, use Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Step 4: Configure Monitoring

1. **Set up error tracking** (Sentry, LogRocket)
2. **Set up analytics** (Google Analytics, Mixpanel)
3. **Set up uptime monitoring** (UptimeRobot, Pingdom)

---

## 🧪 Testing Your Deployment

### Step 1: Test All Features

1. **User Registration/Login**
2. **Video Upload**
3. **Status Creation**
4. **ML Analysis**
5. **Admin Functions**

### Step 2: Performance Testing

1. **Load testing** (Artillery, k6)
2. **Database performance**
3. **CDN configuration**

---

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check Supabase CORS settings
   - Verify frontend URLs

2. **Database Connection Issues**:
   - Check connection strings
   - Verify network access

3. **ML Service Not Working**:
   - Check environment variables
   - Verify service is running
   - Check logs

4. **Build Failures**:
   - Check Node.js version
   - Verify all dependencies
   - Check environment variables

### Debug Commands:

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs ml-service

# Test database connection
psql $DATABASE_URL

# Test ML service
curl https://your-ml-service.com/healthz
```

---

## 📊 Monitoring & Maintenance

### Daily:
- Check error logs
- Monitor performance metrics
- Verify backups

### Weekly:
- Update dependencies
- Review security logs
- Test all features

### Monthly:
- Security audit
- Performance optimization
- Database cleanup

---

## 🎉 You're Live!

Your Matobev app should now be fully deployed and accessible to users worldwide!

**Next Steps:**
1. Share your app with users
2. Monitor performance
3. Gather feedback
4. Iterate and improve

**Support:**
- Check logs for issues
- Monitor error tracking
- Keep dependencies updated
- Regular backups

---

## 📞 Need Help?

If you encounter any issues during deployment:
1. Check the troubleshooting section
2. Review service logs
3. Verify all environment variables
4. Test each component individually

Good luck with your deployment! 🚀
