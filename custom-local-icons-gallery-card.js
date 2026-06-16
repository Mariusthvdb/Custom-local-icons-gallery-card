const name = "Custom local icons gallery card";
const version = "1.4.0";
const description = "Lists all icons installed via C L I integration";
const repo = "https://github.com/Mariusthvdb/Custom-local-icons-gallery-card";
const badgeStyle =
  "color: white; background: linear-gradient(90deg, #41BDF5, #2C6ECB);" +
  "padding: 2px 8px; font-weight: bold; border-radius: 0px;";

console.groupCollapsed(
  `%c🏠🎨 ${name} %c✨${version}`,
  badgeStyle,
  badgeStyle
);
console.log("💬", description);
console.log("📄 Readme: %s", repo);
console.groupEnd();


class CustomLocalIconsGalleryCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.icons = [];
    this.filteredIcons = [];

    this.searchValue = localStorage.getItem("cli_search") || "";
    this.colorMode = localStorage.getItem("cli_colorMode") !== "false";
    this.density = localStorage.getItem("cli_density") || "ha";

    const raw = localStorage.getItem("cli_favorites");
    this.favorites = raw ? JSON.parse(raw) : [];

    this.densities = {
      cp: { size: 24, min: 80, gap: 6 }, //compact
      cf: { size: 36, min: 90, gap: 8 }, //comfortable
      lg: { size: 56, min: 120, gap: 8 }, //large
      ul: { size: 72, min: 160, gap: 18 }, //ultra
    };

    this.config = {
      title: "Custom Local Icons",
      url: "/custom_local_icons/list",
      on_color: "var(--state-icon-color, var(--primary-color))",
      off_color: "var(--disabled-text-color)",
    };

    this.translations = {
      en: {
        search: "Search icons...",
        copied: "Copied",
        no_icons: "No icons found",
        icons: "icons",
        clear_favorites: "Clear favorites",
        density_compact: "Compact",
        density_comfortable: "Comfortable",
        density_large: "Large",
        density_ultra: "Ultra",
      },

      nl: {
        search: "Zoek iconen...",
        copied: "Gekopieerd",
        no_icons: "Geen iconen gevonden",
        icons: "iconen",
        clear_favorites: "Favorieten wissen",
        density_compact: "Compact",
        density_comfortable: "Comfortabel",
        density_large: "Groot",
        density_ultra: "Extra groot",
      },

      de: {
        search: "Symbole suchen...",
        copied: "Kopiert",
        no_icons: "Keine Symbole gefunden",
        icons: "Symbole",
        clear_favorites: "Favoriten löschen",
        density_compact: "Kompakt",
        density_comfortable: "Komfortabel",
        density_large: "Groß",
        density_ultra: "Extra groß",
      },
    };
  }

  async _load() {
    try {
      const res = await fetch(this.config.url);

      const data = await res.json();

      this.icons = data;

      // één duidelijke sort stap
      this.icons.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      if (this.searchValue) {
        this._filter(this.searchValue);
        return;
      }

      this.filteredIcons = this.icons;
      this._update();

    } catch (e) {
      console.error("[CLI] load failed", e);
    }
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
    this._load();
  }

  _normalize(s) {
    return (s || "").toLowerCase().replace(/[\s_-]/g, "");
  }

  _score(n, q) {
    if (!q) return 1;

    if (n === q) return 100;
    // if (n.startsWith(q)) return 90;
    if (n.includes(q)) return 80;

    let score = 0, qi = 0, gap = 0;

    for (let i = 0; i < n.length && qi < q.length; i++) {
      if (n[i] === q[qi]) {
        score += 10 - (gap < 5 ? gap : 5);
        qi++;
        gap = 0;
      } else gap++;
    }

    return qi === q.length ? score : 0;
  }

  _filter(value) {
    const raw = (value || "").trim().toLowerCase();

    this.searchValue = raw;
    localStorage.setItem("cli_search", raw);

    if (!raw) {
      this.filteredIcons = this.icons;
      this._update();
      return;
    }

    const query = this._normalize(raw);

    const results = [];
    const icons = this.icons;

    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      const score = this._score(icon.name, query);

      if (score > 0) {
        results.push({ icon, score });
      }
    }

    results.sort((a, b) =>
      b.score - a.score ||
      a.icon.name.localeCompare(b.icon.name)
    );

    const out = new Array(results.length);

    for (let i = 0; i < results.length; i++) {
      out[i] = results[i].icon;
    }

    this.filteredIcons = out;
    this._update();
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
    const t = this.shadowRoot.querySelector("#toast");
    t.textContent = `${this.t("copied")}: ${text}`;
    t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 1200);
  }

  _isFavorite(name) {
    return this.favorites.includes(name);
  }

  _toggleFavorite(name) {
    if (this._isFavorite(name)) {
      this.favorites = this.favorites.filter(n => n !== name);
    } else {
      this.favorites = [...this.favorites, name];
    }
    localStorage.setItem("cli_favorites", JSON.stringify(this.favorites));
    this._update();
  }

  get language() {
    return this._hass?.language || "en";
  }

  set hass(hass) {
    const firstRun = !this._hass;
    const oldLang = this._hass?.language;

    this._hass = hass;

    if (firstRun || oldLang !== hass.language) {
      this._renderShell();
      this._update();
    }
  }

  t(key) {
    return (
      this.translations[this.language]?.[key] ||
      this.translations.en?.[key] ||
      key
    );
  }

  _renderShell() {
    this.shadowRoot.innerHTML = `
      <ha-card>

        <div class="card-header">${this.config.title}</div>

        <div class="card-content">

          <div class="wrapper">

            <div class="top-row">
              <div class="search-container">
                <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                <input id="search" placeholder="${this.t("search")}">
                <button id="clearSearch" class="clear-btn">
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </div>

              <button id="colorToggle" class="toggle-btn">
                <ha-icon icon="mdi:toggle-switch"></ha-icon>
              </button>

              <div class="density-select-wrapper">
                <select id="density" class="density-select">
                  <option value="cp">${this.t("density_compact")}</option>
                  <option value="cf">${this.t("density_comfortable")}</option>
                  <option value="lg">${this.t("density_large")}</option>
                  <option value="ul">${this.t("density_ultra")}</option>
                </select>
              </div>
            </div>

            <div class="count"></div>
            <div class="grid"></div>

            <div id="toast" class="toast"></div>

          </div>

        </div>

        <!-- FOOTER / ACTIONS -->
          <div class="card-actions">

            <div class="favorites-footer">
              <div class="favorites-row-footer"></div>
            </div>

            <button id="clearFavorites" class="clear-fav-btn">
              <ha-icon icon="mdi:star-off"></ha-icon>
            </button>

            <div class="version">v${version}</div>

          </div>

      </ha-card>

      <style>
        .card-header {
          background: var(--card-header-background);
          color: var(--card-header-color);

          padding: 8px 12px;
          font-size: 20px;
          height: 40px;

          display: flex;
          align-items: center;
          font-weight: 600;

          border-top-left-radius: var(--ha-card-border-radius);
          border-top-right-radius: var(--ha-card-border-radius);
        }

        .card-content {
          padding: 0;
        }

        .card-actions {
          display: flex;
          align-items: center;

          padding: 6px 12px 8px;
          gap: 8px;
        }

        .favorites-row-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .wrapper {
          padding: 8px;
          position: relative;
        }

        .version {
          text-align: right;
          opacity: 0.5;
          font-size: 11px;
          color: white;
          background: linear-gradient(90deg, #41BDF5, #2C6ECB);
          padding: 2px 8px;
          font-weight: bold;
          border-radius: 0px;
        }

        .top-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          display: flex;
          flex: 1 1 auto;
          gap: 6px;
          align-items: center;
          position: relative;
          min-width: 120px;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          pointer-events: none;
          color: var(--secondary-text-color);
        }

        .search-container input {
          color: var(--primary-text-color);
          flex: 1 1 auto;
          height: 36px;
          padding: 0 10px 0 34px;
          border-radius: var(--ha-card-border-radius);
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
        }

        .clear-btn,
        .toggle-btn {
          height: 36px;
          width: 36px;
          border-radius: var(--ha-card-border-radius);
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .density-select-wrapper { position: relative; }

        .density-select {
          height: 36px;
          padding: 0 34px 0 10px;
          border-radius: var(--ha-card-border-radius);
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          appearance: none;
          cursor: pointer;
        }

        .density-select-wrapper::after {
          content: "";
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid var(--secondary-text-color);
          pointer-events: none;
        }

        .no-icons {
          white-space: nowrap;
          text-align: center;
          opacity: 0.6;
          color: var(--error-color);
        }

        .favorites-footer {
          display: flex;
          flex: 1;
          overflow-x: auto;
        }

        .favorites-row-footer {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .clear-fav-btn {
          height: 24px;
          width: 24px;
          border-radius: var(--ha-card-border-radius);
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .clear-fav-btn ha-icon {
          color: gold;
        }

        .clear-fav-btn:hover {
          background: red;
          transition: background 0.15s ease;
        }

        .favorite-chip {
          cursor: copy;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(127,127,127,0.08);
          border: 1px solid var(--divider-color);
          font-size: 12px;
        }

        .chip-icon {
          width: 20px;
          height: 20px;
          /*cursor: pointer;*/
          display: inline-block;
        }

        .chip-icon:hover {
          opacity: 0.7;
          cursor: zoom-out;
          transform: scale(1.15);
        }

        .grid {
          display: grid;
          gap: 10px;
          max-height: 350px;
          overflow-y: auto;
          margin-top: 10px;
        }

        .icon {
          position: relative;
          text-align: center;
          padding: 12px;

          cursor: pointer;
        }

        .icon:hover {
          background: rgba(127,127,127,0.08);
          transition: background 0.15s ease;
        }

        .icon:active {
          background: rgba(127,127,127,0.18);
          transform: scale(0.97);
          transition: transform 0.05s ease;
        }

        .favorite-toggle {
          position: absolute;
          top: 2px;
          right: 24px;
          width: 10px;
          height: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
        }

        .favorite-toggle ha-icon {
          width: 10px;
          height: 10px;
          color: gold;
        }

        .favorite-toggle.active ha-icon {
          /*color: var(--state-icon-color, var(--primary-color));*/
        }

        .icon-img {
          display: inline-block;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-size: contain;
          mask-size: contain;
        }

        .label {
          font-size: 12px;
          margin-top: 8px;
          word-break: break-word;
        }

        .count {
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.7;
        }

        .toast {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          padding: 6px 14px;
          border-radius: var(--ha-card-border-radius);
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .toast.show {
          opacity: 1;
        }
      </style>
    `;

    const searchInput = this.shadowRoot.querySelector("#search");
    searchInput.value = this.searchValue;
    searchInput.addEventListener("input", e => this._filter(e.target.value));

    this.shadowRoot.querySelector("#clearSearch")
      .addEventListener("click", () => {
        searchInput.value = "";
        localStorage.removeItem("cli_search");
        this._filter("");
      });

    const densitySelect = this.shadowRoot.querySelector("#density");
    densitySelect.value = this.density;
    densitySelect.addEventListener("change", e => {
      this.density = e.target.value;
      localStorage.setItem("cli_density", this.density);
      this._update();
    });

    const toggleBtn = this.shadowRoot.querySelector("#colorToggle");

    toggleBtn.style.color = this.colorMode
      ? this.config.on_color
      : this.config.off_color;

    toggleBtn.querySelector("ha-icon")
      .setAttribute("icon",
        this.colorMode ? "mdi:toggle-switch" : "mdi:toggle-switch-off"
      );

    toggleBtn.addEventListener("click", () => {
      this.colorMode = !this.colorMode;
      localStorage.setItem("cli_colorMode", this.colorMode);

      toggleBtn.style.color = this.colorMode
        ? this.config.on_color
        : this.config.off_color;

      toggleBtn.querySelector("ha-icon")
        .setAttribute("icon",
          this.colorMode ? "mdi:toggle-switch" : "mdi:toggle-switch-off"
        );

      this._update();
    });

    this.shadowRoot.querySelector("#clearFavorites")
      .addEventListener("click", () => {
        this.favorites = [];
        localStorage.setItem("cli_favorites", "[]");
        this._update();
      });
  }

  _update() {
    const cfg = this.densities[this.density];
    const grid = this.shadowRoot.querySelector(".grid");
    const count = this.shadowRoot.querySelector(".count");
    const favRow = this.shadowRoot.querySelector(".favorites-row-footer");
    const clearBtn = this.shadowRoot.querySelector("#clearFavorites");

    grid.style.gridTemplateColumns =
      `repeat(auto-fill, minmax(${cfg.min}px, 1fr))`;
    grid.style.gap = `${cfg.gap}px`;

    if (this.favorites.length > 0) {
      clearBtn.style.display = "flex";

      favRow.innerHTML = this.favorites
        .map(name => `
          <div class="favorite-chip" data-name="${name}">
            <div class="chip-icon"
              style="
                background-color:${this.colorMode ? this.config.on_color : this.config.off_color};
                -webkit-mask-image:url('/custom_local_icons/icons/${name}.svg');
                mask-image:url('/custom_local_icons/icons/${name}.svg');
              "
            ></div>
            <span>${name}</span>
          </div>
        `)
        .join("");

      favRow.querySelectorAll(".favorite-chip").forEach(el => {
        el.addEventListener("click", () => this._copy(el.dataset.name));
      });

      favRow.querySelectorAll(".chip-icon").forEach(el => {
        el.addEventListener("click", e => {
          e.stopPropagation();

          const name = el.parentElement.dataset.name;
          this._toggleFavorite(name);
        });
      });

    } else {
      favRow.innerHTML = "";
      clearBtn.style.display = "none";
    }

    if (this.filteredIcons.length === 0) {
      grid.innerHTML = `
        <div class="no-icons">
          ${this.t("no_icons")}
        </div>`;
      count.textContent = `0 ${this.t("icons")}`;
      return;
    }

    count.textContent =
      `${this.filteredIcons.length} ${this.t("icons")}`;

    const size = cfg.size;

    grid.innerHTML = this.filteredIcons
      .map(icon => `
        <div class="icon" data-name="${icon.name}">
          <div class="favorite-toggle ${this._isFavorite(icon.name) ? "active" : ""}" data-name="${icon.name}">
            <ha-icon icon="${this._isFavorite(icon.name) ? "mdi:star" : "mdi:star-outline"}"></ha-icon>
          </div>

          <div class="icon-img"
            style="
              width:${size}px;
              height:${size}px;
              background-color:${this.colorMode ? this.config.on_color : this.config.off_color};
              -webkit-mask-image:url('/custom_local_icons/icons/${icon.name}.svg');
              mask-image:url('/custom_local_icons/icons/${icon.name}.svg');
            "
          ></div>

          <div class="label">${icon.name}</div>
        </div>
      `)
      .join("");

    grid.querySelectorAll(".icon").forEach(el => {
      el.addEventListener("click", () => this._copy(el.dataset.name));
    });

    grid.querySelectorAll(".favorite-toggle").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        this._toggleFavorite(el.dataset.name);
      });
    });
  }

  getCardSize() { return 10; }
}

customElements.define(
  "custom-local-icons-gallery-card",
  CustomLocalIconsGalleryCard
);
