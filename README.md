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
