![marketplace_badge](https://img.shields.io/badge/Marketplace-Custom-blue?logo=homeassistantcommunitystore&logoColor=white)
[![GH-release](https://img.shields.io/github/v/release/Mariusthvdb/Custom-local-icons-gallery-card.svg?style=flat-square)](https://github.com/Mariusthvdb/Custom-local-icons-gallery-card/releases)
[![GH-downloads](https://img.shields.io/github/downloads/Mariusthvdb/Custom-local-icons-gallery-card/total)](https://github.com/Mariusthvdb/Custom-local-icons-gallery-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Mariusthvdb/Custom-local-icons-gallery-card.svg?style=flat-square)](https://github.com/Mariusthvdb/Custom-local-icons-gallery-card/commits/main)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Mariusthvdb/Custom-local-icons-gallery-card.svg?color=red&style=flat-square)](https://github.com/Mariusthvdb/Custom-local-icons-gallery-card)

# Custom Local Icons Gallery Card

A dedicated Lovelace card for the [Custom Local Icons integration](https://github.com/mariusthvdb/custom_local_icons/) .

Automatically displays all custom local icons loaded by the integration, providing a convenient way to browse, search, preview and copy icon names directly from your Home Assistant dashboard.


<img width="514" height="536" alt="custom-local-icons-gallery-card" src="https://github.com/user-attachments/assets/9b0b2865-8664-42b6-8326-03fd578aec5d" />

## Features

- Automatically retrieves the icons provided by the Custom Local Icons integration.
- Search icons by name, including partial and fuzzy matching.
- Click an icon to copy its name to the clipboard.
- Mark frequently used icons as favourites.
- Quickly access favourites from the card footer.
- Choose between four display densities.
- Toggle icon colours.
- Automatically adapts to the Home Assistant interface language (English, Dutch and German).

Search terms, favourites, display density and colour preferences are retained in browser local storage.

## Requirements

- Home Assistant.
- The [Custom Local Icons integration](https://github.com/Mariusthvdb/custom_local_icons/) installed and configured.

The gallery card uses the integration's API to retrieve the available icons. It does not install or manage icons itself.

## Installation

<!-- ha-marketplace:exclude-start -->

Install through Home Assistant's Custom Marketplace:

[![Add to Custom Marketplace](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=Mariusthvdb&repository=Custom-local-icons-gallery-card&category=plugin)

If the repository is not yet listed in the Marketplace catalog, the link allows you to add it as a custom repository.

<!-- ha-marketplace:exclude-end -->

After installation, reload your browser to load the new dashboard resource.

## Usage

Add the card to a dashboard using the Manual card editor:

```yaml
type: custom:custom-local-icons-gallery-card-lit
```

### Optional configuration

The card supports the following optional settings:

| Option | Description |
|---|---|
| `title` | Card title |
| `icon` | Header icon |
| `entities` | Optional entities displayed above the gallery |
| `url` | API endpoint used to retrieve the icons |
| `on_color` | Icon colour when colour mode is enabled |
| `off_color` | Icon colour when colour mode is disabled |

Example:

```yaml
type: custom:custom-local-icons-gallery-card-lit
title: Custom Local Icons
icon: mdi:palette
```

## Troubleshooting

If the card does not display any icons:

1. Verify that the Custom Local Icons integration is installed and working.
2. Check that the integration has loaded the icons successfully.
3. Open your browser's developer console.
4. Look for the **Custom local icons gallery card** entry in the console.

The card logs its name, version and repository link when loaded.

If you encounter problems, please open an issue in this repository.

## Check correct loading

Open Browser inspector console and look for Gallery card

<img width="548" height="96" alt="Scherm­afbeelding 2026-06-16 om 14 42 45" src="https://github.com/user-attachments/assets/f64d5e9d-66ad-4ea3-a158-3d26f3a71c4b" />


click arrow to reveal description and link to this repository

<img width="546" height="74" alt="Scherm­afbeelding 2026-06-16 om 14 42 58" src="https://github.com/user-attachments/assets/2f8196a3-3c24-4e32-b2c0-6ecc9517a50b" />

## Credits

Developed by [@Mariusthvdb](https://github.com/Mariusthvdb).
