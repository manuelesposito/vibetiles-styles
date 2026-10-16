# Vibetiles Styles

A library of styles for [Vibetiles](https://github.com/manuelesposito/vibetiles), the WordPress plugin that lets you design your site on the live page. Every style here is one JSON record. Copy it into the panel and it is on your site.

## Use a style

1. Open a style's folder and copy the contents of `style.json`.
2. On your site, open the Vibetiles panel, press the ••• menu and choose **Paste Style…**.
3. The style appears among your own. Show it to readers or make it the default from its tile's menu.

Each style says which Vibetiles version it needs (`vibetiles` in the record). Older panels keep what they know and drop the rest.

## Add a style

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: export your style with **Copy as JSON**, add a folder under `styles/` with the record and a short README, and open a pull request. A check runs on every pull request.

## Files

- `styles/<slug>/style.json`: the record, as the panel's Copy as JSON writes it, without an `id`.
- `styles/<slug>/README.md`: one paragraph on the style and a line saying who made it.
- `styles/<slug>/preview.png`: optional, a picture of the style on a page.
- `index.json`: every style in one file, written by `node tools/build-index.mjs`; `order.txt` names the slugs that come first.
- `schema/`: what a record may contain, copied from the plugin.
- `tools/check-style.mjs`: the check the pull requests run.

## Licence

GPL-2.0-or-later, like the plugin.
