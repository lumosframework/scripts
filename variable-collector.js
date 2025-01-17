// store color themes
const colorTheme = [];
const htmlStyles = getComputedStyle(document.documentElement);
const targetStylesheet = document.querySelector("#color-themes");
const regex = /--([^:\s]+):\s*var\(--([^)]+)\);/g;
if (targetStylesheet) {
  const rules = targetStylesheet.sheet.cssRules || targetStylesheet.sheet.rules;
  for (const rule of rules) {
    if (rule.cssText.includes("data-theme=") && !rule.cssText.includes(`data-theme="0"`)) {
      const styleObject = {};
      let match;
      while ((match = regex.exec(rule.cssText)) !== null) {
        const key = "--" + match[1];
        const value = htmlStyles.getPropertyValue("--" + match[2]);
        styleObject[key] = value;
      }
      colorTheme.push(styleObject);
    }
  }
}
//   ...colorThemes[0]
export const colorThemes = colorTheme;
