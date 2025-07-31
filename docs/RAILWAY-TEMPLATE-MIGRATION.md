# Railway Template Migration Guide

## Überblick

Diese Anleitung beschreibt, wie du das Medusa Backend über das Railway Template "Medusajs 2.0 + Storefront" deployst und deine bestehenden Anpassungen überträgst.

## Schritt 1: Railway Template Deployment

1. Gehe zu Railway und wähle das Template: **"Medusajs 2.0 + Storefront"** von Rasmus Puls
2. Klicke auf "Deploy"
3. Railway wird automatisch:
   - PostgreSQL Datenbank erstellen
   - Redis Instance erstellen
   - Medusa Backend deployen
   - Storefront deployen (optional - kann später deaktiviert werden)

## Schritt 2: Environment Variables

Nach dem initialen Deployment, setze diese Environment Variables in Railway:

```env
# Supabase Datenbank (WICHTIG: Ersetze die Railway PostgreSQL URL!)
DATABASE_URL=postgresql://postgres.arcaytnxsrhvnaohgcef:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Secrets (verwende deine bestehenden)
JWT_SECRET=[DEIN_JWT_SECRET]
COOKIE_SECRET=[DEIN_COOKIE_SECRET]

# CORS Settings
STORE_CORS=https://shop.dersolarwart.de,http://localhost:3000
ADMIN_CORS=https://api.dersolarwart.de,http://localhost:7000

# Redis (wird von Railway automatisch gesetzt)
REDIS_URL=[AUTOMATISCH_VON_RAILWAY]

# Worker Mode
MEDUSA_WORKER_MODE=server
DISABLE_MEDUSA_ADMIN=false
```

## Schritt 3: Code Migration

### Dateien die du übertragen musst:

1. **Kompletter src/ Ordner**
   ```
   src/
   ├── api/          # Deine custom API endpoints
   ├── modules/      # Deine custom Module
   ├── workflows/    # Deine Workflows
   ├── subscribers/  # Event Handler
   ├── jobs/         # Background Jobs
   ├── links/        # Entity Links
   └── scripts/      # Seeds und Setup Scripts
   ```

2. **Config Dateien**
   - `medusa-config.js` - ERSETZE die Template-Version mit deiner
   - `.env` - Nur als Referenz, Variables in Railway setzen

3. **NICHT übertragen**
   - `package.json` - Verwende die vom Template
   - `node_modules/`
   - `.medusa/`
   - Alle Docker/Railway Config Files

### Migration durchführen:

```bash
# 1. Clone das deployed Railway Repo
git clone [RAILWAY_REPO_URL] medusa-railway-deploy
cd medusa-railway-deploy

# 2. Kopiere deine Anpassungen
cp -r ../solarwart-medusa-backend-v1/src/* ./src/
cp ../solarwart-medusa-backend-v1/medusa-config.js ./

# 3. Commit und Push
git add .
git commit -m "Migrate custom Solarwart code"
git push

# Railway wird automatisch deployen
```

## Schritt 4: Datenbank Migration

Nach erfolgreichem Deployment:

1. Führe Migrations aus (Railway Console oder lokal):
   ```bash
   npm run seed
   ```

2. Erstelle Admin User:
   ```bash
   npx medusa exec ./src/scripts/reset-admin-password.ts
   ```

## Schritt 5: GitHub Repository Setup

### Option A: Neues Repo verwenden
```bash
# Das Railway Repo als neues Origin
cd medusa-railway-deploy
git remote rename origin railway
git remote add origin https://github.com/[DEIN-GITHUB]/solarwart-medusa-backend-v2.git
git push -u origin main
```

### Option B: Bestehendes Repo aktualisieren
```bash
# In deinem alten Repo
cd solarwart-medusa-backend-v1
git checkout -b legacy-docker-attempts
git push -u origin legacy-docker-attempts

# Dann main branch resetten
git checkout main
git reset --hard [LETZTER_FUNKTIONIERENDER_COMMIT]
# Kopiere alle Dateien vom Railway Deploy
# Committe als "Switched to Railway Template deployment"
```

## Entwicklungs-Workflow

### Lokale Entwicklung

1. **Setup**
   ```bash
   # Clone von GitHub (nicht Railway!)
   git clone https://github.com/[DEIN-GITHUB]/solarwart-medusa-backend-v2.git
   cd solarwart-medusa-backend-v2
   npm install
   ```

2. **Environment**
   ```bash
   # .env.local für lokale Entwicklung
   cp .env.example .env.local
   # Füge deine lokalen Supabase Credentials ein
   ```

3. **Entwickeln**
   ```bash
   npm run dev
   ```

### Deployment Workflow

```mermaid
graph LR
    A[Lokale Entwicklung] --> B[Git Push zu GitHub]
    B --> C[PR erstellen]
    C --> D[Review & Merge]
    D --> E[Railway Auto-Deploy]
```

1. **Feature Branch**
   ```bash
   git checkout -b feature/neue-funktion
   # Entwickle deine Features
   git add .
   git commit -m "feat: Neue Funktion"
   git push -u origin feature/neue-funktion
   ```

2. **Pull Request**
   - Erstelle PR auf GitHub
   - Lass Code reviewen
   - Merge zu main

3. **Auto-Deploy**
   - Railway detected Push zu main
   - Baut und deployed automatisch
   - Monitor in Railway Dashboard

### Best Practices

1. **NIEMALS direkt auf Railway entwickeln**
   - Railway Repo nur für Deployment
   - Alle Entwicklung über GitHub

2. **Environment Variables**
   - Lokal: `.env.local`
   - Production: Railway Dashboard
   - NIEMALS `.env` files committen

3. **Testing vor Deploy**
   ```bash
   npm run build
   npm run test
   ```

4. **Branches**
   - `main` - Production (auto-deploy zu Railway)
   - `develop` - Staging (optional)
   - `feature/*` - Neue Features
   - `fix/*` - Bugfixes

## Troubleshooting

### Häufige Probleme

1. **"Cannot find module" Fehler**
   - Stelle sicher dass alle Dependencies in package.json sind
   - Führe `npm install` aus

2. **Datenbank Connection Fehler**
   - Prüfe DATABASE_URL in Railway
   - Verwende Port 6543 (Transaction Pooler) nicht 5432

3. **Admin Dashboard nicht erreichbar**
   - Prüfe ADMIN_CORS Environment Variable
   - Stelle sicher DISABLE_MEDUSA_ADMIN=false

### Support

- Railway Status: https://status.railway.app/
- Medusa Discord: https://discord.gg/medusajs
- Railway Discord: https://discord.gg/railway

## Nächste Schritte

1. ✅ Deploy via Railway Template
2. ✅ Migrate Custom Code
3. ✅ Setup GitHub Workflow
4. 🚀 Entwickle neue Features!

---

**Wichtig**: Dokumentiere alle Änderungen in `CHANGELOG.md` und halte diese Anleitung aktuell!