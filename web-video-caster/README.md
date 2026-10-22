# StreamBeam Caster

A browser-based video casting app modelled on Web Video Caster. It is a single
self-contained file (`index.html`); open it in a browser or serve the folder
with any static server (`npx serve web-video-caster`).

## Features

- **Browser**: open a page or paste a link. The app lists the videos it finds
  (MP4, WebM, HLS `.m3u8`, DASH `.mpd`) with Cast / Queue / Copy link actions.
  Pages that block cross-origin requests (CORS) can't be scanned, so paste the
  direct video link for those.
- **Remote**: TV preview, seek, play/pause, skip back/forward, stop, next,
  volume, mute, playback speed and `.srt` / `.vtt` subtitles.
- **Cast devices**: "Nearby screen" uses the browser's Remote Playback API,
  which does real Chromecast / AirPlay casting in supporting browsers. The
  Chromecast, Roku, Fire TV, DLNA and AirPlay entries are **demo receivers**
  (simulated) and can be hidden in Settings.
- **Screen mirroring**: share the entire screen, a window or a browser tab
  (`getDisplayMedia`) at 720p/1080p/1440p and 15/30/60 fps, with optional
  sound, live stats and a Stop control in the bottom bar. A web page can't
  push a captured screen to a real TV by itself, so the Mirror screen also
  lists the built-in mirroring steps for Chrome, Edge, Windows (Miracast),
  Mac/iPhone/iPad (AirPlay), Android, Roku and Fire TV, with the viewer's
  own platform marked first. Screen capture needs a desktop browser; phones
  and embedded frames that block it fall back to those steps.
- **Queue** with reorder and autoplay-next, **Local files** (drag and drop),
  **IPTV** M3U playlists with groups and search, **Bookmarks**, **History**
  with resume, and **Settings**.
- Light and dark themes; works at phone width with bottom tabs.

Queue, history, bookmarks, playlist and settings are kept in `localStorage`.
HLS playback in non-Safari browsers uses hls.js from jsDelivr.

## Next steps toward native-level casting

- Google Cast Web Sender SDK for direct Chromecast sessions.
- A small local helper (Node/Electron) for SSDP discovery so real DLNA, Roku
  (ECP) and Fire TV devices can be found and controlled.
