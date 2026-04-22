# PETUNIAS OPEN — Guía de Deploy

## Opción 1: Netlify (Recomendado, gratuito)

1. Entrá a [netlify.com](https://netlify.com) y creá una cuenta gratis
2. En el dashboard hacé clic en **"Add new site" → "Deploy manually"**
3. Arrastrá la **carpeta del proyecto** (o el ZIP) directo a la ventana
4. ¡Listo! Te da una URL tipo `petunias-open.netlify.app`
5. Para personalizar el dominio: Site Settings → Domain Management

> El archivo `netlify.toml` ya está configurado en el proyecto.

---

## Opción 2: Vercel (también gratuito)

1. Subí el proyecto a GitHub:
   - Creá repo en [github.com](https://github.com)
   - Subí todos los archivos del proyecto
2. Entrá a [vercel.com](https://vercel.com)
3. "New Project" → importá tu repo de GitHub
4. Framework: **Other** (sin framework)
5. Output directory: `.` (raíz)
6. Deploy → URL instantánea

---

## Opción 3: GitHub Pages (más simple aún)

1. Subí los archivos a un repo de GitHub
2. Settings → Pages → Source: `main` branch, folder `/root`
3. URL: `tuusuario.github.io/petunias-open`

---

## ⚠️ Importante sobre los datos

La app guarda todo en `localStorage` del navegador.
- Los datos **NO se comparten** entre dispositivos automáticamente
- Usá el **Panel Admin → Backup** para exportar/importar datos
- Si querés datos compartidos en tiempo real entre usuarios, necesitás un backend (Supabase, Firebase, etc.)

---

## Estructura del proyecto

```
PETUNIAS OPEN.html     ← App principal
js/
  utils.js             ← Helpers de jugadores
  tournamentHelpers.js ← Lógica de torneos
  auth.js              ← Sistema de login
  ProgressCircle.jsx
  RadarChart.jsx
  PlayerForm.jsx
  PlayerCard.jsx
  PlayerGallery.jsx
  ComparisonView.jsx
  TournamentViews.jsx
  TournamentSystem.jsx
  HistorialView.jsx
  AuthModal.jsx
  NewsSection.jsx
  AdminPanel.jsx
  BackupPanel.jsx
assets/
  bg.png
  logo1.svg / logo2.svg / logo3.svg
netlify.toml           ← Config para Netlify
```
