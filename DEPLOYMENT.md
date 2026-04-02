# GardenMind Deployment Guide

## Vercel Deployment

### Initial Setup

1. **Create a new Vercel project**
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js settings

2. **Add Vercel Postgres database**
   ```bash
   # In Vercel Dashboard:
   Storage → Create → Postgres → Create Database
   ```

3. **Set environment variables**

   Go to Project Settings → Environment Variables and add:

   ```bash
   # Database (auto-populated if using Vercel Postgres)
   DATABASE_URL=<your-postgres-connection-string>

   # Auth0
   AUTH0_SECRET=<generate-with-openssl-rand-hex-32>
   AUTH0_BASE_URL=https://your-app.vercel.app
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=<from-auth0-dashboard>
   AUTH0_CLIENT_SECRET=<from-auth0-dashboard>
   ```

4. **Update Auth0 settings**

   In your Auth0 Application settings, add:
   - **Allowed Callback URLs**: `https://your-app.vercel.app/api/auth/callback`
   - **Allowed Logout URLs**: `https://your-app.vercel.app`

5. **Run database migrations**

   From your local machine:
   ```bash
   # Get your production DATABASE_URL from Vercel
   # Then run migrations
   DATABASE_URL="your-vercel-postgres-url" npx prisma migrate deploy
   ```

   Or using Vercel CLI:
   ```bash
   vercel env pull .env.production
   DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
   ```

6. **Deploy**
   ```bash
   git push origin main
   # Vercel will auto-deploy
   ```

### Verify Deployment

1. Visit `https://your-app.vercel.app`
2. Click "Login" to test Auth0
3. Navigate to Planner and create a bed
4. If you see "Error fetching beds", the migrations weren't run (see step 5 above)

## Database Migrations

### When to run migrations

Run migrations whenever you:
- Deploy for the first time
- Make schema changes (add/modify tables)
- Pull changes that include new migration files

### Commands

```bash
# Deploy migrations to production
DATABASE_URL="production-url" npx prisma migrate deploy

# Create a new migration (development)
npx prisma migrate dev --name description-of-change

# Reset database (DESTRUCTIVE - dev only!)
npx prisma migrate reset
```

## Troubleshooting

### "Table does not exist" error
- Run `prisma migrate deploy` pointing to your production database
- Check that DATABASE_URL is set correctly in Vercel

### "PrismaClient is not defined" build error
- Ensure `postinstall` script exists in package.json
- Check that Prisma is in `dependencies`, not `devDependencies`

### Auth0 redirect errors
- Verify all callback URLs in Auth0 match your Vercel deployment URL
- Check that AUTH0_BASE_URL in Vercel matches your actual domain
- Ensure AUTH0_SECRET is set (generate with `openssl rand -hex 32`)

### Database connection timeouts
- Vercel Postgres has connection limits - use connection pooling
- Check that POSTGRES_PRISMA_URL (pooled connection) is being used
- Monitor connections in Vercel Dashboard

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgresql://user:pass@host/db` |
| `AUTH0_SECRET` | Random secret for session encryption | Generate with `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | Your app's URL | `https://gardenmind.vercel.app` |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 tenant URL | `https://dev-abc123.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | From Auth0 dashboard |
| `AUTH0_CLIENT_SECRET` | Auth0 application secret | From Auth0 dashboard |

## Post-Deployment

1. **Test all features**
   - Login/logout
   - Create/edit/delete beds
   - Plant placement
   - Drag-and-drop

2. **Monitor**
   - Check Vercel Logs for errors
   - Monitor database usage in Vercel Dashboard
   - Set up error tracking (optional: Sentry, etc.)

3. **Custom domain** (optional)
   - Add custom domain in Vercel Dashboard
   - Update AUTH0_BASE_URL
   - Update Auth0 callback URLs
