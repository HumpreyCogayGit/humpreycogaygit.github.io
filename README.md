# MangHumps — Humprey Cogay's Desktop Portfolio

A dependency-free desktop-style portfolio built with semantic HTML, CSS, and vanilla JavaScript.

## Features

- Draggable, minimizable, maximizable application windows
- Automatic intro with randomly selected line preludes (a Lissajous particle mesh, eased tracer lines, or orbiting circles) that settle into the desktop heading
- Project introductions for AI Engineering, Precis, Speculo, Scapesaur, Numero, and Text Classification
- Centered Windows 11-inspired Start menu with pinned projects
- Desktop `about.txt` and interactive command-line applications
- Working keyboard-enabled calculator (without `eval`)
- Navigable monthly calendar
- Live Open-Meteo weather with city search, geolocation, and unit switching
- Dedicated gallery for interactive HTML, CSS, and JavaScript animation studies
- Light and dark themes with an animated circular-reveal switch (follows the system setting until a visitor picks one)
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

The weather app and desktop widget use the free Open-Meteo forecast and geocoding APIs. They do not require or expose an API key. The widget requests browser location permission on its first visit so it can show local weather automatically; visitors can deny the request and search for a city in the Weather app instead. The last successful place and preferred temperature unit are saved in browser `localStorage`.