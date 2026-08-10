# Parasorter

A cross-platform desktop application for the manual inspection and curation of homolog trees. Parasorter is part of the [PhyloFisher](https://thebrownlab.github.io/phylofisher-pages/) project.

## Overview

Parasorter loads a phylogenetic tree and lets you visually inspect it, tagging each taxon as an **ortholog**, **paralog**, or a candidate for **deletion**. Results can be imported/exported as TSV, making it easy to integrate curation results into downstream PhyloFisher workflows.

## Features

- Open and render phylogenetic trees for manual review
- Mark taxa as ortholog (`o`), paralog (`p`), or delete (`d`)
- Import existing classifications from a TSV file
- Save/export classifications to a TSV file
- Zoom in/out and fit-to-screen controls
- Find bar for locating taxa within large trees
- Reposition class markers left/right for easier reading

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) and npm

### Setup

```bash
git clone https://github.com/AlexTiceLab/parasorter.git
cd parasorter
npm install
```

### Run in development

```bash
npm start
```

## Building distributables

Parasorter uses [electron-builder](https://www.electron.build/) to package platform-specific installers.

```bash
# All platforms (mac, windows, linux)
npm run dist

# macOS only
npm run dist-mac

# Windows only
npm run dist-win

# Linux only
npm run dist-lin
```

Packaged builds are written to the `dist/` folder.

### macOS code signing & notarization

To distribute a signed, notarized build (required for Gatekeeper to allow the app to run without warnings on other Macs), you'll need an Apple Developer account.

**1. Get a signing certificate**

- Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year) if you haven't already.
- In Xcode → Settings → Accounts → Manage Certificates, create a **"Developer ID Application"** certificate. This installs into your login keychain automatically.

**2. Let electron-builder find it**

electron-builder auto-detects a "Developer ID Application: Your Name (TEAMID)" certificate in your keychain. If you have multiple certificates, pin the one to use:

```bash
export CSC_NAME="Developer ID Application: Your Name (TEAMID)"
```

**3. Set up notarization credentials**

Create an app-specific password at [appleid.apple.com](https://appleid.apple.com) (Sign-In and Security → App-Specific Passwords), then set:

```bash
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

Alternatively, use an App Store Connect API key instead:

```bash
export APPLE_API_KEY="/path/to/AuthKey_XXXX.p8"
export APPLE_API_KEY_ID="XXXX"
export APPLE_API_ISSUER="issuer-id"
```

**4. Build**

```bash
npm run dist-mac
```

electron-builder signs and notarizes automatically since `hardenedRuntime` is enabled in the `build.mac` config and the Apple credentials above are present — no extra scripts required.

> **Note:** [build/sign_adhoc.sh](build/sign_adhoc.sh) applies an **ad-hoc** signature (`codesign --sign -`), which only satisfies Gatekeeper on your own machine. It's useful for local testing but is not a substitute for real Developer ID signing + notarization when distributing to others.

## Usage

1. **Open Tree** (`Cmd/Ctrl+O`) — load a tree file to inspect.
2. **Import tsv** (`Cmd/Ctrl+Shift+O`) — load existing ortholog/paralog/delete classifications.
3. Click the `o` / `p` / `d` markers next to each taxon to set its classification.
4. **Save tsv** (`Cmd/Ctrl+S`) — export your classifications.
5. Use **Find** (`Cmd/Ctrl+F`) to search for specific taxa, and the zoom controls to navigate large trees.

## Project structure

```
main.js         Electron main process
preload.js      Preload script for the main window
about.html      "About" window
index.html      Main application window
js/             Application logic (rendering, menu, tree parsing)
css/            Stylesheets
build/          Packaging/signing scripts
```

## License

Released under the [MIT License](LICENSE).
