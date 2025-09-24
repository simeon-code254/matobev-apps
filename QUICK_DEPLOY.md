# ⚡ Quick Deploy Guide - Matobev App

This is the fastest way to get your Matobev app live in production.

## 🎯 Recommended: Vercel + Supabase + Railway

### Prerequisites (5 minutes)
1. **GitHub Account** - [github.com](https://github.com)
2. **Vercel Account** - [vercel.com](https://vercel.com) 
3. **Supabase Account** - [supabase.com](https://supabase.com)
4. **Railway Account** - [railway.app](https://railway.app)

---

## 🚀 Step-by-Step Deployment (30 minutes)

### Step 1: Prepare Your Code (5 minutes)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Create production environment file**:
```bash
# Copy the template
cp shared/env-templates/production.env .env.production

# Edit with your values (we'll get these in next steps)
```

### Step 2: Set up Supabase Database (10 minutes)

1. **Go to [Supabase](https://supabase.com)**
2. **Click "New Project"**
3. **Fill in details**:
   - Name: `matobev-production`
   - Database Password: `Generate a strong password` (save this!)
   - Region: `Choose closest to your users`

4. **Wait for setup to complete** (2-3 minutes)

5. **Get your credentials**:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

6. **Set up storage**:
   - Go to Storage
   - Create bucket: `videos` (public)
   - Create bucket: `thumbnails` (public)

7. **Run database setup**:
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run"

### Step 3: Deploy Frontend to Vercel (10 minutes)

1. **Go to [Vercel](https://vercel.com)**
2. **Click "Import Project"**
3. **Connect your GitHub repository**
4. **Deploy users-app**:
   - Root Directory: `users-app`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Set environment variables**:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_ML_SERVICE_URL=https://your-ml-service.railway.app
   ```

6. **Deploy admin-app** (repeat steps 4-5 with `admin-app` folder)

### Step 4: Deploy ML Service to Railway (5 minutes)

1. **Go to [Railway](https://railway.app)**
2. **Click "Deploy from GitHub repo"**
3. **Select your repository**
4. **Choose `ml-service` folder**
5. **Set environment variables**:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/database
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

6. **Deploy**

### Step 5: Update CORS Settings (2 minutes)

1. **Go back to Supabase**
2. **Settings → API**
3. **Add to CORS origins**:
   - `https://your-users-app.vercel.app`
   - `https://your-admin-app.vercel.app`

---

## 🎉 You're Live!

Your app should now be accessible at:
- **Users App**: `https://your-users-app.vercel.app`
- **Admin App**: `https://your-admin-app.vercel.app`
- **ML Service**: `https://your-ml-service.railway.app`

---

## 🧪 Test Your Deployment

1. **Visit your users app**
2. **Create an account**
3. **Upload a video**
4. **Create a status**
5. **Test admin functions**

---

## 🔧 Troubleshooting

### Common Issues:

**"CORS Error"**:
- Check Supabase CORS settings
- Make sure you added your Vercel URLs

**"Database Connection Failed"**:
- Check your DATABASE_URL in Railway
- Make sure Supabase is running

**"ML Service Not Working"**:
- Check Railway logs
- Verify environment variables

**"Build Failed"**:
- Check Vercel build logs
- Make sure all dependencies are installed

---

## 📞 Need Help?

1. **Check the full [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
2. **Run the deployment script**: `./deploy.bat` (Windows) or `./deploy.sh` (Mac/Linux)
3. **Check service logs** in Vercel/Railway dashboards

---

## 🎯 Next Steps

1. **Custom Domain**: Point your domain to Vercel
2. **SSL Certificate**: Automatic with Vercel
3. **Monitoring**: Set up error tracking
4. **Analytics**: Add Google Analytics
5. **Backups**: Set up database backups

**Congratulations! Your Matobev app is now live! 🚀**
