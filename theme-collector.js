/**
 * Theme Collector 1.1.0
 * Released under the MIT License
 * Released on: January 17, 2025
 */
function getColorThemes() {
  const STORAGE_KEYS = { THEMES: "colorThemes_data", PUBLISH_DATE: "colorThemes_publishDate" };
  function getPublishDate() {
    const htmlComment = document.documentElement.previousSibling;
    return htmlComment?.nodeType === Node.COMMENT_NODE
      ? new Date(htmlComment.textContent.match(/Last Published: (.+?) GMT/)[1]).getTime()
      : null;
  }
  function loadFromStorage() {
    try {
      const storedDate = localStorage.getItem(STORAGE_KEYS.PUBLISH_DATE), currentDate = getPublishDate();
      if (!currentDate || !storedDate || storedDate !== currentDate.toString()) return null;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.THEMES));
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
      return null;
    }
  }
  function saveToStorage(themes) {
    try {
      const publishDate = getPublishDate();
      if (publishDate) {
        localStorage.setItem(STORAGE_KEYS.PUBLISH_DATE, publishDate.toString());
        localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
      }
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }
  window.colorThemes = {
    themes: {},
    getTheme(themeName = "", brandName = "") {
      if (!themeName) return this.getTheme(Object.keys(this.themes)[0], brandName);
      const theme = this.themes[themeName];
      if (!theme) return {};
      return (!theme.brands || Object.keys(theme.brands).length === 0) ? theme : theme.brands[brandName] || theme.brands[Object.keys(theme.brands)[0]];
    },
  };
  const cachedThemes = loadFromStorage();
  if (cachedThemes) {
    window.colorThemes.themes = cachedThemes;
    document.dispatchEvent(new CustomEvent("colorThemesReady"));
    return;
  }
  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (!firstLink?.href) return null;
  const themeVars = new Set(), themeClasses = new Set(), brandClasses = new Set();
  fetch(firstLink.href)
    .then((res) => res.ok ? res.text() : Promise.reject(`Failed to fetch: ${res.statusText}`))
    .then((cssText) => {
      (cssText.match(/--_theme[\w-]+:\s*[^;]+/g) || []).forEach(v => themeVars.add(v.split(":"")[0].trim()));
      (cssText.match(/\.u-(theme|brand)-[\w-]+/g) || []).forEach(cls => cls.startsWith(".u-theme-") ? themeClasses.add(cls) : brandClasses.add(cls));
      const themeVarsArray = Array.from(themeVars);
      function checkClass(themeClass, brandClass = null) {
        let docClasses = document.documentElement.getAttribute("class");
        document.documentElement.setAttribute("class", "");
        document.documentElement.classList.add(themeClass, brandClass);
        const styles = {};
        themeVarsArray.forEach(v => styles[v] = getComputedStyle(document.documentElement).getPropertyValue(v));
        document.documentElement.setAttribute("class", docClasses);
        return styles;
      }
      themeClasses.forEach(themeCls => {
        const themeName = themeCls.replace(".", "").replace("u-theme-", "");
        window.colorThemes.themes[themeName] = { brands: {} };
        brandClasses.forEach(brandCls => {
          const brandName = brandCls.replace(".", "").replace("u-brand-", "");
          window.colorThemes.themes[themeName].brands[brandName] = checkClass(themeCls.replace(".", ""), brandCls.replace(".", ""));
        });
        if (!brandClasses.size) window.colorThemes.themes[themeName] = checkClass(themeCls.replace(".", ""));
      });
      saveToStorage(window.colorThemes.themes);
      document.dispatchEvent(new CustomEvent("colorThemesReady"));
    })
    .catch((error) => console.error("Error:", error));
}
window.addEventListener("DOMContentLoaded", () => getColorThemes());
