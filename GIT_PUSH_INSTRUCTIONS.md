# GitHub Push Anweisungen

## Problem
GitHub hat die Passwort-Authentifizierung für HTTPS-URLs am 13. August 2021 deaktiviert.

## Lösung: Personal Access Token verwenden

### 1. GitHub Personal Access Token erstellen
1. Gehe zu: https://github.com/settings/tokens
2. Klicke auf "Generate new token" → "Generate new token (classic)"
3. Gib dem Token einen Namen: "Momentmillionär Replit"
4. Wähle Ablaufzeit (empfohlen: 90 Tage)
5. Wähle Berechtigung: `repo` (voller Repository-Zugriff)
6. Klicke "Generate token"
7. **WICHTIG**: Kopiere den Token sofort - er wird nur einmal angezeigt!

### 2. Git Push mit Token
```bash
# Mit Token als Benutzername (xxx ist dein Token):
git push https://xxx@github.com/momentmillionaer/app.git main

# Oder Remote URL dauerhaft aktualisieren:
git remote set-url origin https://xxx@github.com/momentmillionaer/app.git
git push origin main
```

## Alternative: SSH-Key verwenden
1. SSH-Key erstellen: `ssh-keygen -t ed25519 -C "deine@email.com"`
2. Public Key zu GitHub hinzufügen: https://github.com/settings/keys
3. Remote URL ändern: `git remote set-url origin git@github.com:momentmillionaer/app.git`

## Aktueller Status
- 39 Commits warten auf Push zu GitHub
- Alle Timezone-Updates (GMT+2 Vienna) sind bereit
- Connihof Favoriten-Titel implementiert
- Notion Sync-Endpoint funktioniert

## Commit-Details
```
Timezone update to GMT+2 (Vienna/Weiz) and Notion sync enhancements

✓ Updated all date/time displays to Austrian timezone (Europe/Vienna)
✓ Server health endpoint shows local Vienna time for monitoring  
✓ Event card date comparisons use accurate Austrian timezone
✓ Event modal, latest event popup, and share dialogs updated
✓ Added 'conni's favoriten' title in Connihof font for favorites view
✓ Manual Notion sync endpoint (/api/sync) for forced updates
✓ Fixed TypeScript compatibility issues in event modal
✓ 199 events synchronized from Notion database
```