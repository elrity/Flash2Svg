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
- **YouTube**: paste any YouTube link (watch, youtu.be, Shorts, live,
  embed, playlists, mobile and music hosts; `t=` start times are kept) or
  scan a page with embedded YouTube videos. Videos play in the official
  YouTube IFrame Player, which the remote drives (play/pause, seek, skip,
  volume, mute, speed, queue/autoplay, resume from history). YouTube does not
  let other apps pull its video files for casting, so the Remote also offers
  three ways onto a real TV: Open in YouTube (the app's own Cast button),
  Link with TV code, and mirroring the tab. Videos whose owners turned off
  embedding show a clear message. The YouTube player needs the app served
  over http(s), e.g. `npx serve web-video-caster`, not opened as a file.
- **VLC as the player**: three ways, for formats browsers can't decode
  (MKV, AVI, FLV, WMV, TS, DASH, HEVC…) or for VLC's playback in general.
  - *Cast to VLC*: pick **VLC media player** in the cast list and VLC
    becomes the receiver (e.g. on a PC or Raspberry Pi wired to the TV);
    the app's remote drives play/pause, seek, volume, mute, speed, stop and
    queue autoplay. See "VLC setup" below.
  - *Open in VLC*: the VLC button on any video opens it in the VLC app on
    Android/iPhone, or saves an `.m3u` playlist / copies the link for desktop
    VLC (Media → Open Network Stream). The Queue can be saved as a playlist.
  - *Automatic suggestion*: when a video's format needs VLC or the browser
    fails to decode it, the Remote offers Open in VLC / Cast to VLC
    (Settings → Suggest VLC for unsupported videos).
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

## VLC setup (Cast to VLC)

1. In VLC: Tools → Preferences → Show settings: **All** → Interface → Main
   interfaces → tick **Web**; under Main interfaces → Lua set a password;
   restart VLC. Or run `vlc --extraintf http --http-password <password>`.
2. Start the bridge (Node 18+, no dependencies) on the same computer:
   `VLC_PASSWORD=<password> node web-video-caster/vlc-bridge.mjs`
3. Open `http://localhost:8090`, choose **VLC media player** in the cast list.

To use a phone as the remote, start the bridge with `BIND=0.0.0.0` and open
`http://<computer-ip>:8090` on the phone. Other options: `PORT`, `VLC_HOST`,
`VLC_PORT`, `ALLOW_ORIGIN` (to call the bridge from the app hosted elsewhere).

The bridge exists because browsers can't send VLC's password and VLC sends no
CORS headers. It only relays the remote-control commands the app uses, only
lets VLC open network links (never local files), and refuses requests whose
Host header isn't an IP address or localhost.
