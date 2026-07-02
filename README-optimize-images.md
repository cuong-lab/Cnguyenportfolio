# Image optimization helper

This repository includes a Node script to convert images to WebP and generate responsive variants.

Install dependencies:

```bash
npm install
```

Run conversion (defaults):

```bash
npm run convert-images
```

Options:

- `--input` (`-i`): input folder (default `assets/images`)
- `--output` (`-o`): output folder (default `assets/optimized`)
- `--widths` (`-w`): comma-separated widths (default `400,800,1200`)
- `--quality` (`-q`): WebP quality 0-100 (default `80`)

Output: resized WebP files and a `manifest.json` mapping source bases to generated files.
