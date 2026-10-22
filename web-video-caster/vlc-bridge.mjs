#!/usr/bin/env node
// StreamBeam VLC bridge: serves the app and relays /vlc/status to VLC's web interface.
// Browsers can't send VLC's password (and VLC sends no CORS headers), so this adds both.
//
//   VLC_PASSWORD=secret node vlc-bridge.mjs            # this computer only
//   VLC_PASSWORD=secret BIND=0.0.0.0 node vlc-bridge.mjs  # also reachable from your phone
//
// Env: PORT (8090), BIND (127.0.0.1), VLC_HOST (127.0.0.1), VLC_PORT (8080), VLC_PASSWORD,
//      ALLOW_ORIGIN (extra origin allowed to call the bridge, e.g. where you host index.html).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = +process.env.PORT || 8090;
const BIND = process.env.BIND || '127.0.0.1';
const VLC = `http://${process.env.VLC_HOST || '127.0.0.1'}:${+process.env.VLC_PORT || 8080}`;
const AUTH = 'Basic ' + Buffer.from(':' + (process.env.VLC_PASSWORD || '')).toString('base64');
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '';

// Only the remote-control commands the app uses.
const COMMANDS = new Set(['', 'in_play', 'pl_forcepause', 'pl_forceresume', 'pl_stop', 'pl_next', 'pl_previous', 'seek', 'volume', 'rate', 'fullscreen']);
// VLC may only open network media, never files on this computer.
const INPUT = /^(https?|rtsp|rtmp|rtp|udp|mms|srt):\/\//i;
// Host header must be an IP or localhost (blocks DNS-rebinding pages from driving VLC).
const HOST = /^(localhost|\d{1,3}(\.\d{1,3}){3}|\[[0-9a-f:]+\])(:\d+)?$/i;

const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };

http.createServer(async (req, res) => {
  if (!HOST.test(req.headers.host || '')) return json(res, 403, { error: 'Open the bridge by IP address or localhost.' });
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGIN && origin === ALLOW_ORIGIN) res.setHeader('Access-Control-Allow-Origin', origin);
  const url = new URL(req.url, 'http://bridge');

  if (url.pathname === '/vlc/status') {
    if (origin && origin !== `http://${req.headers.host}` && origin !== ALLOW_ORIGIN) return json(res, 403, { error: 'This page isn’t allowed to control VLC. Set ALLOW_ORIGIN to its address.' });
    const cmd = url.searchParams.get('command') || '';
    if (!COMMANDS.has(cmd)) return json(res, 400, { error: `Command “${cmd}” isn’t allowed.` });
    if (cmd === 'in_play' && !INPUT.test(url.searchParams.get('input') || '')) return json(res, 400, { error: 'VLC can only open web and stream links from here.' });
    const opt = url.searchParams.get('option');
    if (opt && !/^start-time=\d+$/.test(opt)) return json(res, 400, { error: 'Option not allowed.' });
    try {
      const r = await fetch(`${VLC}/requests/status.json${url.search}`, { headers: { Authorization: AUTH } });
      if (r.status === 401) return json(res, 401, { error: 'VLC rejected the password. Set VLC_PASSWORD to the password in VLC’s Lua settings.' });
      res.writeHead(r.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(await r.text());
    } catch {
      return json(res, 502, { error: `VLC isn’t answering at ${VLC}. Make sure VLC is open with its web interface turned on.` });
    }
  }

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(await readFile(path.join(dir, 'index.html')));
  }
  res.writeHead(404); res.end('Not found');
}).listen(PORT, BIND, () => {
  console.log(`StreamBeam is at http://${BIND === '0.0.0.0' ? 'localhost' : BIND}:${PORT}  (VLC at ${VLC})`);
  if (BIND === '0.0.0.0') console.log('Reachable from other devices on your network: open http://<this-computer-ip>:' + PORT);
});
