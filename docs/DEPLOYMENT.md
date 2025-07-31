# 🚀 Medusa Backend Deployment Guide - Railway

## Übersicht

Das Medusa Backend (API + Admin UI) wird als eine Einheit auf Railway deployed. 

**URLs nach Deployment:**
- `https://api.dersolarwart.de` → Store API
- `https://admin.dersolarwart.de` → Admin Dashboard

## Schritt-für-Schritt Anleitung

### 1. Vorbereitung

1. **GitHub Repository erstellen** (falls noch nicht geschehen)
   ```bash
   git init
   git add .
   git commit -m "Initial Medusa backend setup v0.1.0"
   git branch -M main
   git remote add origin https://github.com/[dein-username]/solarwart-medusa-backend.git
   git push -u origin main
   ```

2. **Railway Account** bei [railway.app](https://railway.app) (du hast bereits einen)

### 2. Railway Projekt Setup

1. **Neues Projekt in Railway:**
   - Login bei Railway
   - "New Project" → "Deploy from GitHub repo"
   - Wähle dein Repository

2. **Environment Variables hinzufügen:**
   
   In Railway Dashboard → Variables → Add:
   ```
   DATABASE_URL=[Deine Supabase Transaction Pooler URL hier]
   JWT_SECRET=[generiere-32+-zeichen-secret]
   COOKIE_SECRET=[generiere-32+-zeichen-secret]
   STORE_CORS=https://shop.dersolarwart.de
   ADMIN_CORS=https://admin.dersolarwart.de
   AUTH_CORS=https://shop.dersolarwart.de,https://admin.dersolarwart.de
   NODE_ENV=production
   PORT=9000
   MOLLIE_API_KEY=[dein-production-key]
   ```

   **Wichtig:** Generiere neue Secrets für Production!
   ```bash
   # Generiere sichere Secrets:
   openssl rand -base64 32
   ```

### 3. Redis hinzufügen (Optional aber empfohlen)

1. In Railway: "New" → "Database" → "Add Redis"
2. Railway verlinkt automatisch `REDIS_URL`

### 4. Custom Domains konfigurieren

1. **In Railway → Settings → Domains:**
   - Add Domain: `api.dersolarwart.de`
   - Add Domain: `admin.dersolarwart.de`

2. **DNS Records bei deinem Provider:**
   ```
   api.dersolarwart.de    → CNAME → [deine-app].up.railway.app
   admin.dersolarwart.de  → CNAME → [deine-app].up.railway.app
   ```

### 5. Deployment

Railway deployed automatisch bei jedem Push zu main!

Nach dem ersten Deployment:

1. **Admin User erstellen:**
   ```bash
   # In Railway Dashboard → Shell oder via Railway CLI:
   railway run npx medusa user --email admin@dersolarwart.de --password [sicheres-passwort]
   ```

2. **Verify Deployment:**
   - `https://api.dersolarwart.de/health` → Should return OK
   - `https://admin.dersolarwart.de` → Admin Login

### 6. Wichtige Produktions-Einstellungen

1. **Sichere Secrets:** Niemals Development-Secrets in Production verwenden!
2. **CORS:** Nur deine echten Domains erlauben
3. **SSL:** Railway bietet automatisch SSL-Zertifikate
4. **Backups:** Supabase macht automatische Backups

## Troubleshooting

### Admin UI zeigt nicht an?
- Prüfe `ADMIN_CORS` Environment Variable
- Clear Browser Cache
- Check Railway Logs

### API nicht erreichbar?
- DNS kann bis zu 24h dauern
- Prüfe Railway Deployment Status
- Check Health Endpoint

### Database Connection Issues?
- Verwende Transaction Pooler URL
- Prüfe Supabase Status
- Check Railway Logs für Details

## Monitoring

1. **Railway Dashboard:**
   - Metrics
   - Logs
   - Deployments

2. **Supabase Dashboard:**
   - Database Performance
   - Connection Pool Status

## Nächste Schritte nach Deployment

1. ✅ Test Admin Login
2. ✅ Test API Endpoints
3. ✅ Configure Mollie Production Keys
4. ✅ Setup Monitoring/Alerts
5. ✅ Configure Backups
6. ✅ Update Frontend mit Production URLs