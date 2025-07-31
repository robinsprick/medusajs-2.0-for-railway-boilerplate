# Wichtige Dateien für Migration - Backup Checklist

## Kritische Dateien die du UNBEDINGT sichern musst:

### 1. Geschäftslogik & Custom Code
```
src/
├── api/
│   ├── admin/custom/[+]/route.ts        # Custom Admin Routes
│   └── store/
│       ├── products/[handle]/route.ts   # Product Detail Endpoint
│       └── solarwart-products/route.ts  # Custom Product List
├── modules/
│   └── [alle deine custom modules]
├── workflows/
│   └── [alle workflows]
├── scripts/
│   ├── seed.ts                          # Demo Daten
│   ├── setup-solarwart-store.ts         # Store Setup ⭐
│   └── reset-admin-password.ts          # Admin Password Reset ⭐
└── subscribers/
    └── [event handlers]
```

### 2. Konfiguration
```
medusa-config.js                         # Hauptkonfiguration ⭐
.env                                     # Environment Variables (als Referenz)
```

### 3. Dokumentation (zum Nachschlagen)
```
docs/
├── CHANGELOG.md                         # Änderungshistorie
├── RAILWAY-TEMPLATE-MIGRATION.md        # Diese Anleitung
└── PROGRESS.md                          # Projekt-Fortschritt
```

### 4. Daten die du NICHT brauchst:
```
❌ node_modules/
❌ .medusa/
❌ dist/
❌ build/
❌ package-lock.json
❌ Dockerfile*
❌ railway.json
❌ railway.toml
❌ nixpacks.toml
❌ start.sh
❌ simple-server.js
```

## Backup Befehl

```bash
# Erstelle ein Backup der wichtigen Dateien
cd solarwart-medusa-backend-v1
tar -czf solarwart-backup-$(date +%Y%m%d).tar.gz \
  src/ \
  medusa-config.js \
  .env \
  docs/ \
  README.md
```

## Environment Variables die du brauchst:

```env
# PFLICHT
DATABASE_URL=            # Supabase PostgreSQL URL
JWT_SECRET=              # Dein JWT Secret
COOKIE_SECRET=           # Dein Cookie Secret

# CORS (wichtig für Production)
STORE_CORS=https://shop.dersolarwart.de
ADMIN_CORS=https://api.dersolarwart.de

# Optional aber empfohlen
MEDUSA_ADMIN_ONBOARDING_TYPE=skip
STORE_NAME="Solarwart Shop"
```

## Quick-Check vor Migration:

- [ ] Backup erstellt?
- [ ] .env Variablen notiert?
- [ ] Aktuelle Git Commits gepusht?
- [ ] Lokale Änderungen gesichert?
- [ ] Railway Template ausgewählt?

## Nach erfolgreicher Migration:

1. Teste Admin Dashboard: https://api.dersolarwart.de/admin
2. Teste API Health: https://api.dersolarwart.de/health
3. Führe Seed Script aus für Demo-Daten
4. Erstelle Admin User mit reset-admin-password.ts

---

💡 **Tipp**: Behalte das alte Projekt noch 1-2 Wochen als Referenz!