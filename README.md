Matobev Monorepo

Packages
- users-app: Player/Scout app (Vite + React + TS + Tailwind + shadcn)
- admin-app: Admin dashboard (password protected)
- ml-service: FastAPI microservice for video analysis -> Player Cards
- shared: Shared UI, types, utils

Environment
- Copy .env.example to each app as needed
- Netlify for users-app and admin-app
- Render for ml-service

Supabase
- Enable Email OTP auth
- Buckets: videos (auth write), thumbnails (public read), player-cards (public read), avatars (public read)
- Tables: profiles, trials, news, tournaments, messages, uploads, player_cards

Run locally
- users-app: cd users-app && npm install && npm run dev
- admin-app: cd admin-app && npm install && npm run dev
- ml-service: cd ml-service && poetry install && poetry run fastapi dev app/main.py

Do not expose service role key to frontends.
