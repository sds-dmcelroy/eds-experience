# EDS Experience SPA — Browser Milestone 1

This is the first runnable implementation of the **EDS Experience SPA**.

## What is included

- Persistent EDS navigation
- Cinematic River of Information hero
- Chaos → Clarity visual direction
- Scroll progress
- GSAP entrance and scroll animation
- Capture / Ingest scene
- OCR scene
- AI Analysis scene
- Complete remaining pipeline scaffold
- Security strip
- Final CTA and canonical footer
- Responsive and reduced-motion handling
- Supplied EDS artwork and logo references

## Run it

From the folder containing `index.html`:

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Local GSAP installation

The complete licensed GSAP distribution is stored locally in:

```text
vendor/gsap/
```

The application preloads its core cinematic GSAP plugins exclusively from this directory. Additional local plugins remain available to load when a scene requires them. No CDN fallback is used.

ScrollSmoother is initialized with smoothing and effects disabled so the existing visual behavior remains unchanged until cinematic implementation begins.

## Suggested VS Code command

```bash
code .
```

Then start the server in VS Code's integrated terminal.

## Next implementation milestone

1. Develop and approve a new long-term EDS product name and logo identity.
2. Replace the flattened River background with independent river, document, particle, dashboard, and landscape layers.
3. Expand Classification, Entity Extraction, Metadata, and Knowledge Graph into full cinematic scenes.
4. Build Search, Reporting, and Dynamic Binder as the visual climax.
5. Add Collaboration and Local / Cloud / Hybrid deployment.
6. Refine desktop pacing, tablet behavior, mobile simplification, and accessibility.
