# Contributing a style

1. Design your style in Vibetiles on your own site.
2. In the panel, press ••• and choose **Copy as JSON**.
3. Fork this repository and add a folder `styles/<slug>/` (lowercase letters, digits and hyphens).
4. Save the JSON as `style.json`. Remove the `id` line if there is one, and add `"vibetiles": "0.57"` (the version you designed it with).
5. Write `README.md`: a heading with the style's name, one paragraph on what it is, and a line `By <your name or handle>.`
6. Optional: `preview.png`, a screenshot of a page in the style, 1600 pixels wide or so.
7. Run `node tools/check-style.mjs styles/<slug>/style.json` and `node tools/build-index.mjs`.
8. Open a pull request.

What the check wants: `architrave` is 3, a label of up to 40 characters, every key and value known to the schema, text on paper at 4.5:1 or better where the record names its own colours, a README beside the record.

Keep the name short and plain. No brand names, no names of other products or themes.

By contributing you agree your style is published under GPL-2.0-or-later.
