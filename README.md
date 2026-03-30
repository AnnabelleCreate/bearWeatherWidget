# bearWeatherWidget

Portfolio-ready weather widgets featuring a Pittsburgh bear character.

## What this includes

- **Weather bear widget** that:
  - Fetches current weather + short forecast for Pittsburgh via Open-Meteo
  - Auto-selects bear outfits based on weather code, temperature, and wind
  - Updates the scene background and decorations based on season
- **Closet + music widget** that:
  - Lets visitors switch between auto outfit mode and manual outfit mode
  - Lets visitors pick a Spotify music preset
  - Accepts custom Spotify track/album/playlist URLs and converts them to an embed

## Files

- `index.html` - widget layout and UI structure
- `styles.css` - responsive card design, seasonal scenes, bear styling
- `app.js` - weather logic, outfit rules, season rendering, Spotify controls

## Run locally

Any static server works. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
