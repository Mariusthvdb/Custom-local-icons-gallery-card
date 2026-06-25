/* ─────────────────────────────────────────────────────────────
 *  METADATA
 * ───────────────────────────────────────────────────────────── */
const name = "Custom local icons gallery card";
const version = "1.7.5";
const description = "Lists all icons installed via C L I integration";
const repo = "https://github.com/Mariusthvdb/Custom-local-icons-gallery-card";
const badgeStyle =
  "color:white;background:linear-gradient(90deg,#41BDF5,#2C6ECB);padding:2px 8px;font-weight:bold;";

console.groupCollapsed(
  `%c🏠🎨 ${name} %c✨${version}`,
  badgeStyle,
  badgeStyle
);
console.log("💬", description);
console.log("📄 Readme:", repo);
console.groupEnd();

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

/* ─────────────────────────────────────────────────────────────
 *  CLASS
 * ───────────────────────────────────────────────────────────── */
class CustomLocalIconsGalleryCard extends LitElement {
  /* ─────────────────────────────────────────────────────────────
   *  PROPERTIES
   * ───────────────────────────────────────────────────────────── */
  static get properties() {
    return {
      icons: { type: Array },
      filteredIcons: { type: Array },
      favorites: { type: Array },
      searchValue: { type: String },
      colorMode: { type: Boolean },
      density: { type: String },
      _hass: { attribute: false },
      _elements: { state: false },
    };
  }

  /* ─────────────────────────────────────────────────────────────
   *  STYLES
   * ───────────────────────────────────────────────────────────── */
  static get styles() {
    return css`
      :host {
        --control-height: 36px;
        --control-border: 1px solid var(--divider-color);
        --control-radius: var(--ha-card-border-radius);

        --font-size-small: 12px;

        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 12px;
        --spacing-lg: 16px;

        --hover-bg: color-mix(
          in srgb,
          var(--primary-color) 12%,
          transparent
        );

        --neutral-hover-bg: rgba(127, 127, 127, 0.08);
        --neutral-active-bg: rgba(127, 127, 127, 0.18);


        --transition-fast: 0.15s ease;

        --transition-interactive:
          background var(--transition-fast),
          transform var(--transition-fast),
          opacity var(--transition-fast);

        --transition-bg:
          background var(--transition-fast);

        --transition-fade:
          opacity var(--transition-fast);
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      /* HEADER */

      .card-header {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-lg);
      }

      .card-header .name {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
      }

      .card-header .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* CARD CONTENT */

      .card-content {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        padding: 0 var(--spacing-lg) var(--spacing-lg);
      }

      #states {
        margin-bottom: var(--spacing-md);
      }

      /* TOP ROW */

      .top-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        min-width: 0;
      }

      /* SEARCH */

      .search-container {
        display: flex;
        align-items: center;
        flex: 1 1 auto;
        min-width: 0;
        height: var(--control-height);
        padding: 0 var(--spacing-xs);

        border: var(--control-border);
        border-radius: var(--control-radius);

        background: var(--card-background-color);

        transition: var(--transition-bg);
      }

      .search-container:hover {
        background: var(--hover-bg);
      }

      .search-icon {
        color: var(--info-color);
        /* needed for HA icon centered alignment */
        transform: translateY(0.125em);
      }

      .search-input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: var(--primary-text-color);
      }

      /* BUTTONS */

      .clear-btn,
      .clear-fav-btn {
        display: flex;
        align-items: center;
        justify-content: center;

        height: var(--control-height);

        border: var(--control-border);
        border-radius: var(--control-radius);

        background: var(--card-background-color);
        color: var(--primary-color);

        cursor: pointer;

        transition: var(--transition-interactive);
      }

      .clear-fav-btn:hover {
        background: var(--error-color);
      }

      .clear-btn:active,
      .clear-fav-btn:active {
        transform: scale(0.97);
      }

      .clear-btn:focus-visible,
      .clear-fav-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .clear-btn:disabled,
      .clear-fav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* DENSITY SELECT */

      .density-select-wrapper {
        position: relative;
        overflow: hidden;

        display: flex;
        align-items: center;

        flex-shrink: 0;

        height: var(--control-height);

        border: var(--control-border);
        border-radius: var(--control-radius);

        background: var(--card-background-color);

        transition: var(--transition-bg);
      }

      .density-select-wrapper:hover {
        background: var(--hover-bg);
      }

      .density-select {
        padding: 0 28px 0 var(--spacing-sm);

        border: none;
        outline: none;

        background: transparent;
        color: var(--primary-text-color);

        cursor: pointer;
        appearance: none;
      }

      .density-select-wrapper::after {
        content: "";

        position: absolute;
        top: 50%;
        right: var(--spacing-sm);

        transform: translateY(-50%);

        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--secondary-text-color);

        pointer-events: none;
      }

      /* COUNT ROW */

      .count-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin: 0 calc(var(--spacing-xs) * -1);
      }

      .count {
        padding-left: var(--spacing-xs);
        font-size: var(--font-size-small);
        opacity: 0.7;
      }

      /* TOGGLE */

      .toggle-wrapper {
        display: flex;
        align-items: center;
        height: var(--control-height);
      }

      .toggle-wrapper ha-switch {
        transform: scale(0.82);
      }

      /* GRID */

      .grid {
        display: grid;
        max-height: 350px;
        overflow-y: auto;
      }

      .grid-icon {
        position: relative;

        padding: var(--spacing-md);

        text-align: center;

        border-radius: var(--control-radius);

        transition: var(--transition-interactive);
      }

      .grid-icon:hover {
        background: var(--neutral-hover-bg);
      }

      .grid-icon:active {
        background: var(--neutral-active-bg);
        transform: scale(0.97);
      }

      /* FAVORITES */

      .favorite-toggle {
        position: absolute;
        top: 2px;
        right: 24px;

        display: flex;
        align-items: center;

        width: 10px;
        height: 10px;
      }

      .favorite-toggle ha-icon {
        width: 10px;
        height: 10px;
        color: gold;
      }

      .icon-img {
        display: inline-block;

        cursor: copy;

        mask-repeat: no-repeat;
        mask-position: center;
        mask-size: contain;
      }

      .label {
        font-size: var(--font-size-small);
        word-break: break-word;
        cursor: copy;
      }

      /* EMPTY STATE */

      .no-icons {
        white-space: nowrap;
        text-align: center;

        opacity: 0.6;
        color: var(--error-color);
      }

      /* FOOTER */

      .card-actions {
        display: flex;
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .favorites-footer {
        flex: 1;
      }

      .favorites-row-footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);

        max-height: calc(4 * 32px);
        overflow-y: auto;
      }

      .favorite-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);

        padding: 2px var(--spacing-sm);

        border: var(--control-border);
        border-radius: 999px;

        background: var(--neutral-hover-bg);

        font-size: var(--font-size-small);
        cursor: copy;

        transition: var(--transition-interactive);
      }

      .chip-icon {
        display: inline-block;
        width: 20px;
        height: 20px;

        transition: var(--transition-interactive);
      }

      .chip-icon:hover {
        opacity: 0.7;
        transform: scale(1.15);
        cursor: zoom-out;
      }

      /* TOAST */

      .toast {
        position: absolute;
        bottom: 12px;
        left: 50%;

        transform: translateX(-50%);

        padding: 6px 14px;

        border-radius: var(--control-radius);

        background: var(--primary-background-color);
        color: var(--primary-text-color);

        font-size: var(--font-size-small);

        opacity: 0;
        pointer-events: none;

        transition: var(--transition-fade);
      }

      .toast.show {
        opacity: 1;
      }
    `;
  }

  /* ─────────────────────────────────────────────────────────────
   *  CONSTRUCTOR
   * ───────────────────────────────────────────────────────────── */
  constructor() {
    super();

    this.icons = [];
    this.filteredIcons = [];
    this._elements = new Map();

    this.searchValue = localStorage.getItem("cli_search") || "";
    this.colorMode = localStorage.getItem("cli_colorMode") !== "false";
    this.density = localStorage.getItem("cli_density") || "cf";

    const raw = localStorage.getItem("cli_favorites");
    this.favorites = raw ? JSON.parse(raw) : [];

    this.densities = {
      cp: { size: 24, min: 80, gap: 6 },
      cf: { size: 36, min: 90, gap: 8 },
      lg: { size: 56, min: 120, gap: 8 },
      ul: { size: 72, min: 160, gap: 18 },
    };

    this.config = {
      title: "",
      icon: "",
      url: "/custom_local_icons/list",
      on_color: "var(--state-icon-color, var(--primary-color))",
      off_color: "var(--disabled-text-color, var(--secondary-text-color))",
    };

    this.translations = {
      en: {
        search: "Search icons...",
        search_tooltip: "Search through the icon list",
        copied: "Copied",
        no_icon: "No icons found",
        icon: "icon",
        icons: "icons",
        clear_favorites: "Clear favorites",
        density_compact: "Compact",
        density_comfortable: "Comfortable",
        density_large: "Large",
        density_ultra: "Ultra",
        density_select: "Change density",
        toggle_color: "Toggle color mode",
        clear_search: "Clear search",
        clear_favorites: "Clear favorites",
      },
      nl: {
        search: "Zoek iconen...",
        search_tooltip: "Zoeken in de iconenlijst",
        copied: "Gekopieerd",
        no_icon: "Geen iconen gevonden",
        icon: "icoon",
        icons: "iconen",
        clear_favorites: "Favorieten wissen",
        density_compact: "Compact",
        density_comfortable: "Comfortabel",
        density_large: "Groot",
        density_ultra: "Extra groot",
        density_select: "Dichtheid wijzigen",
        toggle_color: "Kleurmodus wisselen",
        clear_search: "Zoekveld wissen",
        clear_favorites: "Favorieten wissen",
      },
      de: {
        search: "Symbole suchen...",
        search_tooltip: "In der Symbolliste suchen",
        copied: "Kopiert",
        no_icon: "Keine Symbole gefunden",
        icon: "Symbol",
        icons: "Symbole",
        clear_favorites: "Favoriten löschen",
        density_compact: "Kompakt",
        density_comfortable: "Komfortabel",
        density_large: "Groß",
        density_ultra: "Extra groß",
        density_select: "Dichte ändern",
        toggle_color: "Farbschema wechseln",
        clear_search: "Suchfeld löschen",
        clear_favorites: "Favoriten löschen",
      },
    };
  }

  /* ─────────────────────────────────────────────────────────────
   *  CONFIG + HASS
   * ───────────────────────────────────────────────────────────── */
  setConfig(config) {
    this.config = { ...this.config, ...config };
    this._createEntityElements();
    this._load();
  }

  set hass(hass) {
    const oldLang = this._hass?.language;
    this._hass = hass;

    for (const element of this._elements.values()) {
      element.hass = hass;
    }

    if (!oldLang || oldLang !== hass.language) {
      this.requestUpdate();
    }
  }

  /* ─────────────────────────────────────────────────────────────
   *  LOAD + TRANSLATIONS
   * ───────────────────────────────────────────────────────────── */
  async _load() {
    try {
      const res = await fetch(this.config.url);
      const data = await res.json();

      this.icons = data.sort((a, b) => a.name.localeCompare(b.name));

    } catch (e) {
      console.error("[CLI] load failed", e);
    }
  }

  t(key) {
    const lang = this._hass?.language || "en";
    return this.translations?.[lang]?.[key] || this.translations.en[key] || key;
  }

  /* ─────────────────────────────────────────────────────────────
   *  VIEW STATE HELPERS (COLOR + DENSITY)
   * ───────────────────────────────────────────────────────────── */
  _toggleColor(checked) {
    this.colorMode = checked;
    localStorage.setItem("cli_colorMode", String(this.colorMode));
  }

  _setDensity(value) {
    this.density = value;
    localStorage.setItem("cli_density", value);
  }

  /* ─────────────────────────────────────────────────────────────
   *  SEARCH HELPERS
   * ───────────────────────────────────────────────────────────── */
  _normalize(s) {
    return (s || "").toLowerCase().replace(/[\s_-]/g, "");
  }

  _score(n, q) {
    if (!q) return 1;
    if (n === q) return 100;
    if (n.includes(q)) return 80;

    let score = 0;
    let qi = 0;
    let gap = 0;

    for (let i = 0; i < n.length && qi < q.length; i++) {
      if (n[i] === q[qi]) {
        score += 10 - Math.min(gap, 5);
        qi++;
        gap = 0;
      } else {
        gap++;
      }
    }

    return qi === q.length ? score : 0;
  }

  _filter(value) {
    const raw = (value || "").trim().toLowerCase();
    this.searchValue = raw;
    localStorage.setItem("cli_search", raw);

    // Geen zoekterm → toon alles
    if (!raw) {
      this.filteredIcons = this.icons;
      return;
    }

    const query = this._normalize(raw);
    const results = [];

    for (let i = 0; i < this.icons.length; i++) {
      const icon = this.icons[i];
      const score = this._score(icon.name, query);
      if (score > 0) {
        results.push({ icon, score });
      }
    }

    // Sneller sorteren
    results.sort((a, b) => {
      const diff = b.score - a.score;
      return diff !== 0 ? diff : (a.icon.name < b.icon.name ? -1 : 1);
    });

    // Map zonder extra allocaties
    this.filteredIcons = results.map(r => r.icon);
  }


  _clearSearch() {
    this.searchValue = "";
    localStorage.removeItem("cli_search");
    this._filter("");
  }

  updated(changedProps) {
    if (changedProps.has("icons")) {
      this._filter(this.searchValue);
    }
  }

  /* ─────────────────────────────────────────────────────────────
   *  FAVORITES + COPY + TOAST
   * ───────────────────────────────────────────────────────────── */
  _isFavorite(name) {
    return this.favorites.includes(name);
  }

  _toggleFavorite(name) {
    this.favorites = this._isFavorite(name)
      ? this.favorites.filter((n) => n !== name)
      : [...this.favorites, name];

    localStorage.setItem("cli_favorites", JSON.stringify(this.favorites));
  }

  _clearFavorites() {
    this.favorites = [];
    localStorage.setItem("cli_favorites", "[]");
  }

  async _copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    this._showToast(text);
  }

  _showToast(text) {
    const toast = this.renderRoot?.querySelector("#toast");
    if (!toast) return;

    toast.textContent = `${this.t("copied")}: ${text}`;
    toast.classList.add("show");

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 1200);
  }

  /* FAVORITE CHIP RENDERER */
  _renderFavoriteChip(name) {
    return html`
      <div class="favorite-chip" @click=${() => this._copy(name)}>
        <div
          class="chip-icon"
          @click=${(e) => {
            e.stopPropagation();
            this._toggleFavorite(name);
          }}
          style="
            background-color:${this.colorMode
              ? this.config.on_color
              : this.config.off_color};
            -webkit-mask-image:url('/custom_local_icons/icons/${name}.svg');
            mask-image:url('/custom_local_icons/icons/${name}.svg');
          "
        ></div>
        <span>${name}</span>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
   *  ENTITY HELPERS
   * ───────────────────────────────────────────────────────────── */
  async _createEntityElements() {
    this._elements = new Map();

    if (!this.config.entities?.length) return;

    const helpers = await window.loadCardHelpers();

    for (const entityConf of this.config.entities) {
      const config =
        typeof entityConf === "string" ? { entity: entityConf } : entityConf;

      const element = helpers.createRowElement(config);

      if (this._hass) {
        element.hass = this._hass;
      }

      this._elements.set(entityConf, element);
    }

    this.requestUpdate();
  }

  _renderEntity(entityConf) {
    const element = this._elements?.get(entityConf);
    if (!element) return "";
    element.hass = this._hass;
    return element;
  }

  _renderHeader() {
    if (!this.config.title) return "";

    return html`
      <div class="card-header">
        <div class="name">
          ${this.config.icon
            ? html`<ha-icon class="icon" icon=${this.config.icon}></ha-icon>`
            : ""}
          ${this.config.title}
        </div>
      </div>
    `;
  }

  _renderEntities() {
    if (!this.config.entities?.length) return "";
    return html`
      <div id="states" class="ha-scrollbar">
        ${this.config.entities.map((entityConf) =>
          this._renderEntity(entityConf)
        )}
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
   *  ICON RENDERER
   * ───────────────────────────────────────────────────────────── */
  _renderIcon(icon, cfg) {
    return html`
      <div class="grid-icon" @click=${() => this._copy(icon.name)}>
        <div
          class="favorite-toggle"
          @click=${(e) => {
            e.stopPropagation();
            this._toggleFavorite(icon.name);
          }}
        >
          <ha-icon
            icon="${this._isFavorite(icon.name)
              ? "mdi:star"
              : "mdi:star-outline"}"
          ></ha-icon>
        </div>

        <div
          class="icon-img"
          style="
            width:${cfg.size}px;
            height:${cfg.size}px;
            background-color:${this.colorMode
              ? this.config.on_color
              : this.config.off_color};
            -webkit-mask-image:url('/custom_local_icons/icons/${icon.name}.svg');
            mask-image:url('/custom_local_icons/icons/${icon.name}.svg');
          "
        ></div>

        <div class="label">${icon.name}</div>
      </div>
    `;
  }

  _countLabel() {
    const n = this.filteredIcons.length;

    if (n === 0) {
      return this.t("no_icon");
    }

    if (n === 1) {
      return `1 ${this.t("icon")}`;
    }

    return `${n} ${this.t("icons")}`;
  }

  /* ─────────────────────────────────────────────────────────────
   *  MAIN RENDER
   * ───────────────────────────────────────────────────────────── */
  render() {
    const cfg = this.densities[this.density] || this.densities.cf;

    return html`
      <ha-card class="card">
        <!-- HEADER -->
        ${this._renderHeader()}

        <!-- CONTENT -->
        <div class="card-content">
          <!-- ENTITIES -->
          ${this._renderEntities()}

          <!-- TOP ROW -->
          <div class="top-row">

            <!-- SEARCH -->
            <div class="search-container">
              <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>

              <input
                class="search-input"
                type="text"
                .value=${this.searchValue}
                @input=${(e) => this._filter(e.target.value)}
                placeholder=${this.t("search")}
                title=${this.t("search_tooltip")}
              />
            </div>

            <!-- CLEAR SEARCH -->
            ${this.searchValue
              ? html`
                  <button
                    class="clear-btn"
                    title=${this.t("clear_search")}
                    @click=${this._clearSearch}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                `
              : ""}

            <!-- DENSITY SELECT -->
            <div
              class="density-select-wrapper"
              title=${this.t("density_select")}
            >
              <select
                class="density-select"
                .value=${this.density}
                @change=${(e) => this._setDensity(e.target.value)}
              >
                <option value="cp">${this.t("density_compact")}</option>
                <option value="cf">${this.t("density_comfortable")}</option>
                <option value="lg">${this.t("density_large")}</option>
                <option value="ul">${this.t("density_ultra")}</option>
              </select>
            </div>

            <!-- CLEAR FAVORITES -->
            ${this.favorites.length > 0
              ? html`
                  <button
                    class="clear-fav-btn"
                    title=${this.t("clear_favorites")}
                    @click=${this._clearFavorites}
                  >
                    <ha-icon icon="mdi:star-off"></ha-icon>
                  </button>
                `
              : ""}
          </div>

          <!-- COUNT + COLOR TOGGLE -->
          <div class="count-row">
            <div class="count">${this._countLabel()}</div>

            <div class="toggle-wrapper" title=${this.t("toggle_color")}>
              <ha-switch
                .checked=${this.colorMode}
                @change=${(e) => this._toggleColor(e.target.checked)}
              ></ha-switch>
            </div>
          </div>

          <!-- GRID -->
          <div
            class="grid"
            style="
              grid-template-columns: repeat(auto-fill, minmax(${cfg.min}px, 1fr));
              gap: ${cfg.gap}px;
            "
          >
            ${this.filteredIcons.map((icon) => this._renderIcon(icon, cfg))}
          </div>

          <!-- TOAST -->
          <div id="toast" class="toast"></div>
        </div>

        <!-- FAVORITES FOOTER -->
        ${this.favorites.length > 0
          ? html`
              <div class="card-actions">
                <div class="favorites-footer">
                  <div class="favorites-row-footer">
                    ${this.favorites.map((name) =>
                      this._renderFavoriteChip(name)
                    )}
                  </div>
                </div>
              </div>
            `
          : ""}
      </ha-card>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
   *  CARD SIZE
   * ───────────────────────────────────────────────────────────── */
  getCardSize() {
    return 1;
  }
}

customElements.define(
  "custom-local-icons-gallery-card-lit",
  CustomLocalIconsGalleryCard
);