window.colorThemes = [];
const htmlStyles = getComputedStyle(document.documentElement);
const targetStylesheet = document.querySelector(".page_code_color style");
const regex = /--([^:\s]+):\s*var\(--([^)]+)\);/g;
window.colorThemes.push({});

if (targetStylesheet) {
  const rules = targetStylesheet.sheet.cssRules || targetStylesheet.sheet.rules;
  for (const rule of rules) {
    if (rule.cssText.includes("data-theme=") && !rule.cssText.includes(`data-theme="inherit"`)) {
      const styleObject = {};
      let match;
      while ((match = regex.exec(rule.cssText)) !== null) {
        const key = "--" + match[1];
        const value = htmlStyles.getPropertyValue("--" + match[2]);
        styleObject[key] = value;
      }
      window.colorThemes.push(styleObject);
    }
  }
}
