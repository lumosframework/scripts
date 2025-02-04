/**
 * Theme Toggle 1.1.0
 * Released under the MIT License
 * Released on: February 3, 2025
 */
function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  let toggleEl;
  let togglePressed = "false";

  const scriptTag = document.querySelector("[data-theme-toggle-script]");
  if (!scriptTag) {
    console.warn(
      "Script tag with data-theme-toggle-script attribute not found"
    );
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));

  function setColors(themeString, animate) {
    if (typeof gsap !== "undefined" && animate) {
      gsap.to(htmlElement, {
        ...colorThemes.getTheme(themeString),
        duration: colorModeDuration,
        ease: colorModeEase,
      });
    } else {
      htmlElement.classList.remove("u-theme-dark");
      htmlElement.classList.remove("u-theme-light");
      htmlElement.classList.add("u-theme-" + themeString);
    }
  }

  function goDark(dark, animate) {
    console.log(dark);
    if (dark) {
      localStorage.setItem("dark-mode", "true");
      htmlElement.classList.add("dark-mode");
      setColors("dark", animate);
      togglePressed = "true";
    } else {
      localStorage.setItem("dark-mode", "false");
      htmlElement.classList.remove("dark-mode");
      setColors("light", animate);
      togglePressed = "false";
    }
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  function checkPreference(e) {
    goDark(e.matches, false);
  }
  const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
  colorPreference.addEventListener("change", (e) => {
    checkPreference(e);
  });

  let storagePreference = localStorage.getItem("dark-mode");
  if (storagePreference !== null) {
    storagePreference === "true" ? goDark(true, false) : goDark(false, false);
  } else {
    checkPreference(colorPreference);
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[data-theme-toggle-button]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View Dark Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    document.addEventListener("click", function (e) {
      const targetElement = e.target.closest("[data-theme-toggle-button]");
      if (targetElement) {
        let darkClass = htmlElement.classList.contains("dark-mode");
        darkClass ? goDark(false, true) : goDark(true, true);
      }
    });
  });
}
colorModeToggle();
