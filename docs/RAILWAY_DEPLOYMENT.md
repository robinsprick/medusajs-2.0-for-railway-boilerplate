# Railway Deployment Guide

## Required Environment Variables

Set these in your Railway project settings:

### Essential Variables (REQUIRED)
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
JWT_SECRET=[generate-a-secure-random-string]
COOKIE_SECRET=[generate-a-secure-random-string]
NODE_ENV=production
```

**WICHTIG**: Nutze Port 6543 (Transaction Pooler) statt 5432 für Railway!

### CORS Configuration
```
STORE_CORS=https://shop.dersolarwart.de
ADMIN_CORS=https://admin.dersolarwart.de
AUTH_CORS=https://shop.dersolarwart.de
```

### Payment Provider (when ready)
```
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxx
```

### Optional Variables
```
REDIS_URL=redis://... (for caching in production)
```

## Notes

1. **PORT**: Railway automatically provides this - DO NOT set manually
2. **DATABASE_URL**: Use Supabase Transaction Pooler URL for better performance
3. **Secrets**: Generate secure random strings for JWT_SECRET and COOKIE_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Deployment Steps

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set all environment variables above
4. Deploy

## Troubleshooting

### Health Check Failures
- Check deployment logs for error messages
- Verify DATABASE_URL is correctly set
- Ensure all required environment variables are present

### Database Connection Issues
- Use Transaction Pooler URL from Supabase (port 6543)
- Ensure password special characters are URL-encoded
- Check Supabase connection limits

### Build Failures
- The build uses a dummy database URL
- Real DATABASE_URL is only needed at runtime
- Check build logs for specific errors