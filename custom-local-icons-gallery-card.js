const name = "Custom local icons gallery card";
const version = "1.0.1";
const description = "Display icons from custom-local-icons Integration automatically";
const Url = "https://github.com/Mariusthvdb/Custom-local-icons-gallery-card";
const badgeStyle =
  "color: white; background: linear-gradient(90deg, #41BDF5, #2C6ECB);" +
  "padding: 2px 8px; font-weight: bold; border-radius: 0px;";

// Log information about the custom-ui component
console.groupCollapsed(
  `%c🏠🎨 ${name} is installed %c✨${version}`,
  badgeStyle,
  badgeStyle
);
console.log("💬", description);
console.log("Readme:",Url),
console.groupEnd()

class CustomLocalIconsGalleryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.icons = [];
    this.filteredIcons = [];
    this.selectedIndex = 0;

    this.searchValue = "";

    this.colorMode = true; // ON = HA theme color, OFF = disabled color

    this.favorites = new Set(
      JSON.parse(localStorage.getItem("cli_favorites") || "[]"),
    );

    this.densities = {
      compact:     { size: 20, min: 70,  gap: 8 },
      ha:          { size: 24, min: 90,  gap: 10 },
      comfortable: { size: 36, min: 140, gap: 12 },
      large:       { size: 56, min: 200, gap: 14 },
      ultra:       { size: 72, min: 260, gap: 18 },
    };

    this.density = "ha";

    this.config = {
      title: "Custom Local Icons",
      url: "/custom_local_icons/list",

      on_color:
        "var(--state-icon-color, var(--primary-color))",

      off_color:
        "var(--disabled-text-color)",
    };

    console.log("[CLI] init");

    this._renderShell();
    this._load();
  }

  // ---------------- LOAD ----------------
  async _load() {
    try {
      const res = await fetch(this.config.url);
      this.icons = await res.json();

      this.filteredIcons = [...this.icons];

      console.log("[CLI] loaded:", this.icons.length);

      this._update();
    } catch (e) {
      console.error("[CLI] load failed", e);
    }
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
    this._load();
  }

  // ---------------- FUZZY ----------------
  _score(name, q) {
    if (!q) return 1;

    name = name.toLowerCase();
    q = q.toLowerCase();

    if (name === q) return 100;
    if (name.includes(q)) return 80;

    let score = 0;
    let qi = 0;

    for (let i = 0; i < name.length; i++) {
      if (name[i] === q[qi]) {
        score += 2;
        qi++;
      }
      if (qi >= q.length) break;
    }

    return qi === q.length ? score : 0;
  }

  // ---------------- SEARCH ----------------
  _filter(value) {
    const q = (value || "").trim().toLowerCase();

    this.searchValue = q;

    if (!q) {
      this.filteredIcons = [...this.icons];
      this.selectedIndex = 0;
      this._update();
      return;
    }

    const results = this.icons
      .map((icon) => ({
        icon,
        score: this._score(icon.name, q),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    this.filteredIcons = results.map((r) => r.icon);

    this.selectedIndex = 0;

    console.log("[CLI] filtered:", this.filteredIcons.length);

    this._update();
  }

  // ---------------- FAVORITES ----------------
  _toggleFavorite(name) {
    if (this.favorites.has(name)) {
      this.favorites.delete(name);
    } else {
      this.favorites.add(name);
    }

    localStorage.setItem(
      "cli_favorites",
      JSON.stringify([...this.favorites]),
    );

    console.log("[CLI] favorite:", name);

    this._update();
  }

  _clearFavorites() {
    this.favorites.clear();
    localStorage.removeItem("cli_favorites");

    console.log("[CLI] favorites cleared");

    this._update();
  }

  // ---------------- DENSITY ----------------
  _cfg() {
    return this.densities[this.density];
  }

  // ---------------- COPY ----------------
  async _copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("[CLI] copy:", text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  // ---------------- UI ----------------
  _renderShell() {
    this.shadowRoot.innerHTML = `
      <ha-card header="${this.config.title}">
        <div class="wrapper">

          <!-- ROW 1: SEARCH -->
          <div class="search-row">
            <input id="search" placeholder="Search icons..." />
          </div>

          <!-- ROW 2: CONTROLS -->
          <div class="controls-row">

            <select id="density">
              <option value="compact">Compact</option>
              <option value="ha" selected>HA (24px)</option>
              <option value="comfortable">Comfortable</option>
              <option value="large">Large</option>
              <option value="ultra">Ultra</option>
            </select>

            <!-- REAL SWITCH -->
            <label class="switch">
              <input type="checkbox" id="colorSwitch" checked>
              <span class="slider"></span>
              <span class="labelText">Theme color</span>
            </label>

            <button id="clearFav">🧹 Clear</button>

          </div>

          <!-- FAVORITES -->
          <div class="favorites-bar">
            <div class="fav-title">⭐ Favorites</div>
            <div class="fav-list"></div>
          </div>

          <div class="count"></div>
          <div class="grid"></div>

        </div>

        <style>
          .wrapper {
            padding: 12px;
            box-sizing: border-box;
          }

          .search-row input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
          }

          .controls-row {
            display: flex;
            gap: 10px;
            margin-top: 8px;
            align-items: center;
          }

          .controls-row select,
          .controls-row button {
            height: 32px;
          }

          /* ---------------- SWITCH ---------------- */
          .switch {
            display: flex;
            align-items: center;
            gap: 6px;
            user-select: none;
          }

          .switch input {
            display: none;
          }

          .slider {
            width: 34px;
            height: 18px;
            background: var(--disabled-text-color);
            border-radius: 999px;
            position: relative;
            cursor: pointer;
            transition: 0.2s;
          }

          .slider::after {
            content: "";
            width: 14px;
            height: 14px;
            position: absolute;
            top: 2px;
            left: 2px;
            background: white;
            border-radius: 50%;
            transition: 0.2s;
          }

          .switch input:checked + .slider {
            background: var(--primary-color);
          }

          .switch input:checked + .slider::after {
            transform: translateX(16px);
          }

          .labelText {
            font-size: 12px;
          }

          /* ---------------- GRID ---------------- */
          .grid {
            display: grid;
            gap: 10px;
            max-height: 350px;
            overflow-y: auto;
          }

          .icon {
            position: relative;
            text-align: center;
            padding: 10px;
            border-radius: 12px;
            cursor: pointer;
          }



          .star {
            position: absolute;
            top: 6px;
            right: 8px;
            opacity: 0.3;
            cursor: pointer;
          }

          .star.active {
            opacity: 1;
            color: gold;
          }

          /* MASK ICON */
          .icon-img {
            display: inline-block;
            background-color: var(--primary-color);
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


          .favorites-bar {
            margin-top: 10px;
            margin-bottom: 10px;

            padding: 8px;

            background: rgba(127,127,127,0.08);

            border-radius:
              var(--ha-card-border-radius, 12px);
          }

          .fav-title {
            font-size: 12px;
            opacity: 0.7;
            margin-bottom: 6px;
          }

          .fav-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .fav-item {
            cursor: pointer;

            padding: 4px 8px;

            border-radius: 8px;

            background:
              rgba(255,215,0,0.15);

            font-size: 12px;
          }
        </style>
      </ha-card>
    `;

    // ---------------- SEARCH ----------------
    const search = this.shadowRoot.querySelector("#search");

    search.addEventListener("input", (e) =>
      this._filter(e.target.value),
    );

    // ---------------- CONTROLS ----------------
    const density = this.shadowRoot.querySelector("#density");
    const colorSwitch =
      this.shadowRoot.querySelector("#colorSwitch");
    const clearFav =
      this.shadowRoot.querySelector("#clearFav");

    density.addEventListener("change", (e) => {
      this.density = e.target.value;
      console.log("[CLI] density:", this.density);
      this._update();
    });

    colorSwitch.addEventListener("change", (e) => {
      this.colorMode = e.target.checked;
      console.log("[CLI] colorMode:", this.colorMode);
      this._update();
    });

    clearFav.addEventListener("click", () =>
      this._clearFavorites(),
    );
  }

  // ---------------- UPDATE ----------------
  _update() {
    const cfg = this._cfg();

    const grid =
      this.shadowRoot.querySelector(".grid");
    const favList =
      this.shadowRoot.querySelector(".fav-list");
    const count =
      this.shadowRoot.querySelector(".count");

    if (!grid) return;

    grid.style.gridTemplateColumns =
      `repeat(auto-fill, minmax(${cfg.min}px, 1fr))`;

    grid.style.gap = `${cfg.gap}px`;

    favList.innerHTML = [...this.favorites]
      .map(
        (n) => `
          <div
            class="fav-item"
            data-name="${n}"
          >
            ${n}
          </div>
        `,
      )
      .join("");

    favList.querySelectorAll(".fav-item").forEach((el) => {
      el.addEventListener("click", () =>
        this._copy(el.dataset.name),
      );
    });

    // EMPTY STATE FIX
    if (this.filteredIcons.length === 0) {
      grid.innerHTML = `
        <div style="padding:20px;text-align:center;opacity:0.6;">
          No icons found
        </div>
      `;
      count.textContent = "0 icons";
      return;
    }

    count.textContent =
      `${this.filteredIcons.length} icons`;

    const size = cfg.size;

    grid.innerHTML = this.filteredIcons
      .map((icon, i) => `
        <div
          class="icon"
          data-name="${icon.name}"
        >

          <div class="star ${
            this.favorites.has(icon.name) ? "active" : ""
          }">★</div>

          <!-- MASK ICON (THEME CORRECT) -->
          <div
            class="icon-img"
            style="
              width:${size}px;
              height:${size}px;

              background-color:${
                this.colorMode
                  ? this.config.on_color
                  : this.config.off_color
              };

              -webkit-mask-image:
                url('/custom_local_icons/icons/${icon.name}.svg');

              mask-image:
                url('/custom_local_icons/icons/${icon.name}.svg');
            "
          >
            <img
              src="/custom_local_icons/icons/${icon.name}.svg"
              width="${size}"
              height="${size}"
              loading="lazy"
            >
          </div>

          <div class="label">${icon.name}</div>
        </div>
      `)
      .join("");

    grid.querySelectorAll(".icon-img")
      .forEach((el) => {
        const img =
          el.querySelector("img");

        const style =
          getComputedStyle(el);

        const mask =
          style.webkitMaskImage ||
          style.maskImage;

        if (
          mask &&
          mask !== "none"
        ) {
          img.style.display = "none";
        }
      });

    grid.querySelectorAll(".icon").forEach((el) => {
      el.addEventListener("click", () =>
        this._copy(el.dataset.name),
      );
    });

    grid.querySelectorAll(".star").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this._toggleFavorite(
          el.closest(".icon").querySelector(".label")
            .textContent,
        );
      });
    });
  }

  getCardSize() {
    return 10;
  }
}

customElements.define(
  "custom-local-icons-gallery-card",
  CustomLocalIconsGalleryCard,
);
