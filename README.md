# YouTube Auto Skipper

A Chromium browser extension that detects available Skip Ad buttons on YouTube and automatically clicks them.

## Features

- Automatic skip-button detection.
- DOM observation and controlled button checks.
- Manifest V3 background service worker.
- Browser-level click dispatch using the Chrome Debugger API.

## Technology stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension APIs

## Installation

1. Download the latest release ZIP.
2. Extract the ZIP into a folder.
3. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
4. Enable Developer mode.
5. Click Load unpacked and select the extracted folder.
6. Open YouTube and test the extension.

## Development

```bash
npm install
npm run build
```

Load the generated `dist` directory as an unpacked extension.

## Permissions

The extension requests YouTube host access and the Chrome `debugger` permission for its click-dispatch implementation. Review the permission warning before installation.

## Releases

See the repository's Releases section for packaged versions.
