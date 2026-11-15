# MangHumps — Humprey Cogay's Desktop Portfolio

A dependency-free desktop-style portfolio built with semantic HTML, CSS, and vanilla JavaScript.

## Features

- Draggable, minimizable, maximizable application windows
- Automatic, line-driven technology intro whose signal core, rails, and terminology transform into the desktop shortcuts, taskbar, and heading
- Project introductions for AI Engineering, Precis, Speculo, Scapesaur, and Numero
- Working keyboard-enabled calculator (without `eval`)
- Navigable monthly calendar
- Live Open-Meteo weather with city search, geolocation, and unit switching
- Dedicated gallery for interactive HTML, CSS, and JavaScript animation studies
- Responsive mobile layout, keyboard focus styles, and reduced-motion support

The introduction starts automatically, uses only local HTML and CSS animation, and can be dismissed with **Skip intro** or Escape. No audio or third-party assets are loaded.

## Run locally

From `/Users/humprey/root/Dev/HumpreyCogay`:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>. A local server is required because the JavaScript uses ES modules. Weather geolocation works on localhost and on HTTPS deployments.

## Deploy

The repository has no build step. Deploy the directory as-is to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any static web server.

## Weather data

The weather app uses the free Open-Meteo forecast and geocoding APIs. It does not require or expose an API key. Location is requested only after the visitor chooses **Use my location**. The last successful place and preferred temperature unit are saved in browser `localStorage`.