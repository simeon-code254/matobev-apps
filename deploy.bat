@echo off
REM 🚀 Matobev Deployment Script for Windows
REM This script helps you deploy your Matobev app step by step

echo 🚀 Welcome to Matobev Deployment Script!
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] git is not installed. Please install git first.
    pause
    exit /b 1
)

echo [SUCCESS] All requirements are met!

echo.
echo Choose your deployment option:
echo 1) Vercel + Supabase + Railway (Recommended)
echo 2) Netlify + Supabase + Render
echo 3) Self-hosted VPS
echo 4) Build only (no deployment)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto vercel_deploy
if "%choice%"=="2" goto netlify_deploy
if "%choice%"=="3" goto vps_deploy
if "%choice%"=="4" goto build_only
goto invalid_choice

:vercel_deploy
echo [INFO] Starting Vercel + Supabase + Railway deployment...

REM Check git status
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] You have uncommitted changes. Do you want to commit them? (y/n)
    set /p commit_choice="Enter your choice: "
    if /i "%commit_choice%"=="y" (
        git add .
        git commit -m "Prepare for production deployment"
        echo [SUCCESS] Changes committed!
    ) else (
        echo [WARNING] Please commit your changes before deploying.
        pause
        exit /b 1
    )
)

REM Prepare environment files
if not exist ".env.production" (
    echo [WARNING] Creating .env.production file...
    copy "shared\env-templates\production.env" ".env.production"
    echo [WARNING] Please edit .env.production with your production values!
)

REM Build users-app
echo [INFO] Building users-app...
cd users-app
call npm install
call npm run build
cd ..

REM Build admin-app
echo [INFO] Building admin-app...
cd admin-app
call npm install
call npm run build
cd ..

echo [SUCCESS] Frontend applications built successfully!

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Vercel CLI...
    npm install -g vercel
)

REM Deploy users-app
echo [INFO] Deploying users-app to Vercel...
cd users-app
vercel --prod
cd ..

REM Deploy admin-app
echo [INFO] Deploying admin-app to Vercel...
cd admin-app
vercel --prod
cd ..

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Railway CLI...
    npm install -g @railway/cli
)

REM Deploy ML service
echo [INFO] Deploying ML service to Railway...
cd ml-service
railway login
railway deploy
cd ..

echo [SUCCESS] Deployment completed!
echo.
echo 🌐 Your apps should be available at:
echo    Users App: https://your-users-app.vercel.app
echo    Admin App: https://your-admin-app.vercel.app
echo    ML Service: https://your-ml-service.railway.app
echo.
echo 📋 Next steps:
echo    1. Update your Supabase CORS settings
echo    2. Configure your domain (optional)
echo    3. Test all features
echo    4. Set up monitoring
goto end

:netlify_deploy
echo [INFO] Netlify + Supabase + Render deployment...
echo [WARNING] Please follow the manual steps in DEPLOYMENT_GUIDE.md
goto end

:vps_deploy
echo [INFO] Self-hosted VPS deployment...
echo [WARNING] Please follow the manual steps in DEPLOYMENT_GUIDE.md
goto end

:build_only
echo [INFO] Building applications only...

REM Build users-app
echo [INFO] Building users-app...
cd users-app
call npm install
call npm run build
cd ..

REM Build admin-app
echo [INFO] Building admin-app...
cd admin-app
call npm install
call npm run build
cd ..

echo [SUCCESS] Build completed! Check the dist/ folders.
goto end

:invalid_choice
echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo Press any key to exit...
pause >nul
