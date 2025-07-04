// Color Palette Generator JavaScript
class ColorPaletteGenerator {
  constructor() {
    this.colors = ["#000000", "#000000", "#000000", "#000000", "#000000"];
    this.lockedColors = [false, false, false, false, false];
    this.favorites = this.loadFavorites();

    this.initializeElements();
    this.attachEventListeners();
    this.generatePalette();
    this.displayFavorites();
  }

  initializeElements() {
    this.colorBoxes = document.querySelectorAll(".color-box");
    this.generateBtn = document.querySelector(".generate-btn");
    this.saveBtn = document.querySelector(".save-btn");
    this.clearFavoritesBtn = document.querySelector(".clear-favorites-btn");
    this.favoritesContainer = document.querySelector(".favorites-container");
    this.copyFeedback = document.querySelector(".copy-feedback");
  }

  attachEventListeners() {
    // Generate new palette
    this.generateBtn.addEventListener("click", () => {
      this.generatePalette();
    });

    // Save palette to favorites
    this.saveBtn.addEventListener("click", () => {
      this.savePalette();
    });

    // Clear all favorites
    this.clearFavoritesBtn.addEventListener("click", () => {
      this.clearFavorites();
    });

    // Color box interactions
    this.colorBoxes.forEach((box, index) => {
      const copyBtn = box.querySelector(".copy-btn");
      const lockBtn = box.querySelector(".lock-btn");
      const colorDisplay = box.querySelector(".color-display");

      // Copy color on click
      colorDisplay.addEventListener("click", () => {
        this.copyHexCode(this.colors[index]);
      });

      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copyHexCode(this.colors[index]);
      });

      // Lock/unlock color
      lockBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleLock(index);
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.generatePalette();
      }
    });
  }

  generateRandomColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  generatePalette() {
    for (let i = 0; i < 5; i++) {
      if (!this.lockedColors[i]) {
        this.colors[i] = this.generateRandomColor();
      }
    }
    this.updatePaletteDisplay();
  }

  updatePaletteDisplay() {
    this.colorBoxes.forEach((box, index) => {
      const colorDisplay = box.querySelector(".color-display");
      const hexCode = box.querySelector(".hex-code");

      colorDisplay.style.backgroundColor = this.colors[index];
      hexCode.textContent = this.colors[index];

      // Update text color based on brightness
      const brightness = this.getColorBrightness(this.colors[index]);
      hexCode.style.color = brightness > 128 ? "#000" : "#fff";
    });
  }

  getColorBrightness(hexColor) {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  toggleLock(index) {
    this.lockedColors[index] = !this.lockedColors[index];
    const box = this.colorBoxes[index];
    const lockBtn = box.querySelector(".lock-btn");
    const lockOpen = lockBtn.querySelector(".lock-open");
    const lockClosed = lockBtn.querySelector(".lock-closed");

    if (this.lockedColors[index]) {
      box.classList.add("locked");
      lockBtn.classList.add("locked");
      lockOpen.style.display = "none";
      lockClosed.style.display = "block";
    } else {
      box.classList.remove("locked");
      lockBtn.classList.remove("locked");
      lockOpen.style.display = "block";
      lockClosed.style.display = "none";
    }
  }

  async copyHexCode(color) {
    try {
      await navigator.clipboard.writeText(color);
      this.showCopyFeedback();
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = color;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showCopyFeedback();
    }
  }

  showCopyFeedback() {
    this.copyFeedback.classList.add("show");
    setTimeout(() => {
      this.copyFeedback.classList.remove("show");
    }, 2000);
  }

  savePalette() {
    const newPalette = {
      id: Date.now(),
      colors: [...this.colors],
      timestamp: new Date().toLocaleDateString(),
    };

    this.favorites.unshift(newPalette);
    this.saveFavorites();
    this.displayFavorites();

    // Show feedback
    const originalText = this.saveBtn.textContent;
    this.saveBtn.textContent = "Saved!";
    this.saveBtn.style.background = "var(--success)";

    setTimeout(() => {
      this.saveBtn.textContent = originalText;
      this.saveBtn.style.background = "";
    }, 1500);
  }

  loadFavorites() {
    try {
      const saved = localStorage.getItem("colorPaletteFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(
        "colorPaletteFavorites",
        JSON.stringify(this.favorites)
      );
    } catch (e) {
      console.error("Could not save to localStorage:", e);
    }
  }

  displayFavorites() {
    const noFavorites = this.favoritesContainer.querySelector(".no-favorites");

    if (this.favorites.length === 0) {
      if (noFavorites) {
        noFavorites.style.display = "block";
      }
      // Remove all favorite palette elements
      this.favoritesContainer
        .querySelectorAll(".favorite-palette")
        .forEach((el) => el.remove());
      return;
    }

    if (noFavorites) {
      noFavorites.style.display = "none";
    }

    // Clear existing favorites
    this.favoritesContainer
      .querySelectorAll(".favorite-palette")
      .forEach((el) => el.remove());

    // Add favorites
    this.favorites.forEach((palette, index) => {
      const paletteElement = this.createFavoriteElement(palette, index);
      this.favoritesContainer.appendChild(paletteElement);
    });
  }

  createFavoriteElement(palette, index) {
    const paletteDiv = document.createElement("div");
    paletteDiv.className = "favorite-palette";

    paletteDiv.innerHTML = `
            <div class="favorite-colors">
                ${palette.colors
                  .map(
                    (color) => `
                    <div class="favorite-color" style="background-color: ${color}" title="${color}"></div>
                `
                  )
                  .join("")}
            </div>
            <div class="favorite-actions">
                <button class="load-palette-btn" data-index="${index}">Load Palette</button>
                <button class="delete-palette-btn" data-index="${index}" title="Delete palette">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                </button>
            </div>
        `;

    // Add event listeners
    const loadBtn = paletteDiv.querySelector(".load-palette-btn");
    const deleteBtn = paletteDiv.querySelector(".delete-palette-btn");
    const favoriteColors = paletteDiv.querySelectorAll(".favorite-color");

    loadBtn.addEventListener("click", () => {
      this.loadPalette(index);
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deletePalette(index);
    });

    // Copy individual colors from favorites
    favoriteColors.forEach((colorEl, colorIndex) => {
      colorEl.addEventListener("click", () => {
        this.copyHexCode(palette.colors[colorIndex]);
      });
    });

    // Load palette on click
    paletteDiv.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        this.loadPalette(index);
      }
    });

    return paletteDiv;
  }

  loadPalette(index) {
    if (this.favorites[index]) {
      this.colors = [...this.favorites[index].colors];
      this.lockedColors = [false, false, false, false, false];

      // Reset all locks
      this.colorBoxes.forEach((box, i) => {
        box.classList.remove("locked");
        const lockBtn = box.querySelector(".lock-btn");
        lockBtn.classList.remove("locked");
        lockBtn.querySelector(".lock-open").style.display = "block";
        lockBtn.querySelector(".lock-closed").style.display = "none";
      });

      this.updatePaletteDisplay();

      // Scroll to palette
      document.querySelector(".palette-section").scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  deletePalette(index) {
    if (confirm("Are you sure you want to delete this palette?")) {
      this.favorites.splice(index, 1);
      this.saveFavorites();
      this.displayFavorites();
    }
  }

  clearFavorites() {
    if (this.favorites.length === 0) return;

    if (confirm("Are you sure you want to clear all saved palettes?")) {
      this.favorites = [];
      this.saveFavorites();
      this.displayFavorites();
    }
  }

  // Export palette as CSS variables
  exportAsCSS() {
    const cssVariables = this.colors
      .map((color, index) => `  --color-${index + 1}: ${color};`)
      .join("\n");

    const cssText = `:root {\n${cssVariables}\n}`;
    this.copyHexCode(cssText);
  }

  // Generate palette with specific harmony rules
  generateHarmoniousPalette(type = "random") {
    const baseHue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.random() * 30; // 60-90%
    const lightness = 45 + Math.random() * 20; // 45-65%

    let hues = [];

    switch (type) {
      case "monochromatic":
        hues = [baseHue, baseHue, baseHue, baseHue, baseHue];
        break;
      case "analogous":
        hues = [
          baseHue,
          baseHue + 30,
          baseHue + 60,
          baseHue - 30,
          baseHue - 60,
        ];
        break;
      case "complementary":
        hues = [
          baseHue,
          baseHue + 180,
          baseHue + 30,
          baseHue + 150,
          baseHue - 30,
        ];
        break;
      case "triadic":
        hues = [
          baseHue,
          baseHue + 120,
          baseHue + 240,
          baseHue + 60,
          baseHue + 180,
        ];
        break;
      default:
        // Random generation
        for (let i = 0; i < 5; i++) {
          if (!this.lockedColors[i]) {
            this.colors[i] = this.generateRandomColor();
          }
        }
        this.updatePaletteDisplay();
        return;
    }

    // Convert HSL to HEX for non-locked colors
    for (let i = 0; i < 5; i++) {
      if (!this.lockedColors[i]) {
        const adjustedLightness = lightness + (Math.random() - 0.5) * 20;
        const adjustedSaturation = saturation + (Math.random() - 0.5) * 20;
        this.colors[i] = this.hslToHex(
          hues[i] % 360,
          adjustedSaturation,
          adjustedLightness
        );
      }
    }

    this.updatePaletteDisplay();
  }

  hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // Add keyboard shortcuts info
  showKeyboardShortcuts() {
    alert(
      "Keyboard Shortcuts:\n\nSpace - Generate new palette\nCtrl/Cmd + S - Save palette\nEscape - Clear all locks"
    );
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.paletteGenerator = new ColorPaletteGenerator();

  // Add additional keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          window.paletteGenerator.savePalette();
          break;
      }
    }

    if (e.key === "Escape") {
      // Clear all locks
      window.paletteGenerator.lockedColors.fill(false);
      window.paletteGenerator.colorBoxes.forEach((box, i) => {
        box.classList.remove("locked");
        const lockBtn = box.querySelector(".lock-btn");
        lockBtn.classList.remove("locked");
        lockBtn.querySelector(".lock-open").style.display = "block";
        lockBtn.querySelector(".lock-closed").style.display = "none";
      });
    }

    // Number keys 1-5 to toggle locks
    if (e.key >= "1" && e.key <= "5") {
      const index = parseInt(e.key) - 1;
      window.paletteGenerator.toggleLock(index);
    }
  });
});

// Service Worker registration for PWA capabilities (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Service worker registration could be added here for offline functionality
  });
}
