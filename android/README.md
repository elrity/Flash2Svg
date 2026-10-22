# StreamBeam for Android (APK)

An Android app that opens your hosted StreamBeam full screen, with its own
icon and long-press shortcuts (News, Weather, Ask Gemini, Mirror). It is a
Trusted Web Activity: the phone's Chrome runs the page, so casting, YouTube
and Gemini work exactly as on the web, and every server update reaches the
app without reinstalling.

## Build the APK (GitHub Actions)

1. Host StreamBeam first (see `web-video-caster/README.md`, e.g. Render) and
   note its address, such as `https://streambeam-xxxx.onrender.com`.
2. On GitHub: **Actions → Android APK → Run workflow**, paste the address,
   run. (Or set the repository variable `APP_URL` so changes to `android/`
   rebuild automatically.)
3. When it finishes (about 5 minutes), open **Releases** and download
   `StreamBeam-1.N.apk` on your phone. Open it and allow installing from your
   browser when Android asks.

## Hide the browser bar

Android shows a small address bar until it can confirm the app owns the
site. The workflow's summary and release notes print a line like
`ANDROID_CERT_SHA256=AB:CD:…`. Add it to the server's environment (Render →
Environment) and redeploy; the server then publishes
`/.well-known/assetlinks.json`. Reopen the app after a minute.

## Keep one signing key (recommended)

Without a key the workflow signs with a temporary debug key, so a new build
won't install over the old one: uninstall first. To sign every build with
your own key, create it once:

```sh
keytool -genkeypair -v -keystore streambeam.jks -alias streambeam \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 streambeam.jks   # macOS: base64 -i streambeam.jks
```

Add these repository secrets (Settings → Secrets and variables → Actions):
`ANDROID_KEYSTORE_BASE64` (the base64 output), `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS` (`streambeam`), and `ANDROID_KEY_PASSWORD` if it differs.
Keep `streambeam.jks` safe: losing it means users must reinstall. Then update
`ANDROID_CERT_SHA256` on the server with the new fingerprint.

## Build locally

Needs JDK 17, Gradle 8.9+ and the Android SDK (`ANDROID_HOME`):

```sh
cd android
node configure.mjs https://streambeam-xxxx.onrender.com
gradle assembleRelease   # app/build/outputs/apk/release/app-release.apk
```

## Google Play

Play needs an Android App Bundle: run `gradle bundleRelease` with your own
key, then upload `app/build/outputs/bundle/release/app-release.aab` in Play
Console. Play signs the app with its own key, so add Play's "App signing key"
SHA-256 to `ANDROID_CERT_SHA256` too (comma-separated).
