/**
 * Theme Collector 1.0.7
 * Released under the MIT License
 * Released on: January 17, 2025
 */
function getColorThemes() {
  const STORAGE_KEYS = { THEMES: 'colorThemes_data', PUBLISH_DATE: 'colorThemes_publishDate' };
  function getPublishDate() {
    const htmlComment = document.documentElement.previousSibling;
    return htmlComment?.nodeType === Node.COMMENT_NODE ? new Date(htmlComment.textContent.match(/Last Published: (.+?) GMT/)[1]).getTime() : null;
  }

  function loadFromStorage() {
    try {
      const storedPublishDate = localStorage.getItem(STORAGE_KEYS.PUBLISH_DATE), currentPublishDate = getPublishDate();
      if (!currentPublishDate || !storedPublishDate || storedPublishDate !== currentPublishDate.toString()) return null;
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.THEMES));
    } catch (error) { console.warn('Failed to load from localStorage:', error); return null; }
  }

  function saveToStorage(themes) {
    try {
      const publishDate = getPublishDate();
      if (publishDate) {
        localStorage.setItem(STORAGE_KEYS.PUBLISH_DATE, publishDate.toString());
        localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
      }
    } catch (error) { console.warn('Failed to save to localStorage:', error); }
  }

  window.colorThemes = { themes: {}, getTheme(themeName = '', brandName = '') {
    if (!themeName) return this.getTheme(Object.keys(this.themes)[0], brandName);
    const theme = this.themes[themeName];
    if (!theme) return {};
    if (!theme.brands || Object.keys(theme.brands).length === 0) return theme;
    if (!brandName) return theme.brands[Object.keys(theme.brands)[0]];
    return theme.brands[brandName] || {};
  }};

  const cachedThemes = loadFromStorage();
  if (cachedThemes) { window.colorThemes.themes = cachedThemes; document.dispatchEvent(new CustomEvent("colorThemesReady")); return; }

  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (!firstLink?.href) return null;

  const themeVariables = new Set(), themeClasses = new Set(), brandClasses = new Set();

  fetch(firstLink.href)
    .then(response => { if (!response.ok) throw new Error(`Failed to fetch stylesheet: ${response.statusText}`); return response.text(); })
    .then(cssText => {
      (cssText.match(/--_theme[\w-]+:\s*[^;]+/g) || []).forEach(variable => themeVariables.add(variable.split(":")[0].trim()));
      (cssText.match(/\.u-(theme|brand)-[\w-]+/g) || []).forEach(className => {
        if (className.startsWith(".u-theme-")) themeClasses.add(className);
        if (className.startsWith(".u-brand-")) brandClasses.add(className);
      });

      const themeVariablesArray = Array.from(themeVariables);
      function checkClass(themeClass, brandClass = null) {
        document.documentElement.classList.add(themeClass, brandClass); 
        const styleObject = {};
        themeVariablesArray.forEach(variable => styleObject[variable] = getComputedStyle(document.documentElement).getPropertyValue(variable));
        document.documentElement.classList.remove(themeClass, brandClass);
        return styleObject;
      }

      themeClasses.forEach(themeClassWithDot => {
        const themeName = themeClassWithDot.replace(".", "").replace("u-theme-", "");
        window.colorThemes.themes[themeName] = { brands: {} };
        brandClasses.forEach(brandClassWithDot => {
          const brandName = brandClassWithDot.replace(".", "").replace("u-brand-", "");
          window.colorThemes.themes[themeName].brands[brandName] = checkClass(themeClassWithDot.replace(".", ""), brandClassWithDot.replace(".", ""));
        });
        if (!brandClasses.size) window.colorThemes.themes[themeName] = checkClass(themeClassWithDot.replace(".", ""));
      });

      saveToStorage(window.colorThemes.themes);
      document.dispatchEvent(new CustomEvent("colorThemesReady"));
    })
    .catch(error => console.error("Error:", error.message));
}
getColorThemes();
