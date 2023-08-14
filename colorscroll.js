/**
 * Lumos ColorScroll 1.0.2
 * Copyright 2023 Timothy Ricks
 * Released under the MIT License
 * Released on: August 12, 2023
 */
let sectionModes = {};
let sectionModeTotal;
let cardModeTotal;
window.addEventListener("DOMContentLoaded", (event) => {
  // attribute value checker
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }
  // variables
  const targetStylesheet = document.querySelector("#lumos-colors");
  if (targetStylesheet) {
    // get colors
    const rules = targetStylesheet.sheet.cssRules || targetStylesheet.sheet.rules;
    sectionModeTotal = countModes(/sm0-\d+/g, rules);
    cardModeTotal = countModes(/cm0-\d+/g, rules);

    function getResolvedValue(value) {
      const variables = value.match(/var\(([^)]+)\)/g);
      if (variables) {
        for (const variable of variables) {
          const variableName = variable.match(/var\(([^)]+)\)/)[1].trim();
          const variableValue = getComputedStyle(document.documentElement).getPropertyValue(variableName);
          value = value.replace(variable, variableValue);
        }
      }
      return value;
    }
    function countModes(classNamePattern, rules) {
      const uniqueClassNames = new Set();
      for (const rule of rules) {
        const ruleText = rule.cssText || rule.style.cssText;
        const classNames = ruleText.match(classNamePattern);
        if (classNames) {
          classNames.forEach((className) => {
            uniqueClassNames.add(className);
          });
        }
      }
      return uniqueClassNames.size;
    }

    for (let i = 1; i <= sectionModeTotal; i++) {
      let sectionIndex = i;
      sectionModes[`sectionMode${sectionIndex}`] = {};
      sectionModes[`sectionMode${sectionIndex}`]["mode"] = {};
      for (let i = 1; i <= cardModeTotal; i++) {
        sectionModes[`sectionMode${sectionIndex}`][`cardMode${i}`] = {};
      }
    }

    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        for (let i = 1; i <= sectionModeTotal; i++) {
          let sectionIndex = i;
          if (rule.selectorText.includes(`[class*="sm0-${sectionIndex}"],`)) {
            for (let i = 0; i < rule.style.length; i++) {
              const property = rule.style[i];
              const value = getResolvedValue(rule.style.getPropertyValue(property));
              sectionModes[`sectionMode${sectionIndex}`]["mode"][property] = value;
            }
          }
          for (let i = 1; i <= cardModeTotal; i++) {
            const selector = `:is([section-mode="${sectionIndex}"], [class*="sm0-${sectionIndex}"]) :is([card-mode="${i}"], [class*="cm0-${i}"])`;
            if (rule.selectorText.includes(selector)) {
              for (let j = 0; j < rule.style.length; j++) {
                const property = rule.style[j];
                const value = getResolvedValue(rule.style.getPropertyValue(property));
                sectionModes[`sectionMode${sectionIndex}`][`cardMode${i}`][property] = value;
              }
            }
          }
        }
      }
    }

    let durationSetting = attr(0.4, $("#lumos-colors").attr("colorscroll-speed")),
      easeSetting = attr("power1.out", $("#lumos-colors").attr("colorscroll-ease")),
      offsetSetting = attr(50, $("#lumos-colors").attr("colorscroll-offset")),
      breakpointSetting = attr(0, $("#lumos-colors").attr("colorscroll-breakpoint"));
    // scrolltrigger code
    gsap.registerPlugin(ScrollTrigger);
    $("[colorscroll-mode]").each(function () {
      let modeIndex = +$(this).attr("colorscroll-mode");
      let modeCurrent = sectionModes[`sectionMode${modeIndex}`];

      if (modeCurrent !== undefined) {
        ScrollTrigger.create({
          trigger: $(this),
          start: `top ${offsetSetting}%`,
          end: `bottom ${offsetSetting}%`,
          onToggle: ({ self, isActive }) => {
            if (isActive) {
              gsap.matchMedia().add(`(min-width: ${breakpointSetting}px)`, () => {
                gsap.to("body", { ...sectionModes[`sectionMode${modeIndex}`]["mode"], duration: durationSetting, ease: easeSetting });
                for (let i = 1; i <= cardModeTotal; i++) {
                  let cards = $(`[card-mode="${i}"], [class*="cm0-${i}"]`);
                  cards.each(function (index) {
                    if ($(this).closest("[section-mode]:not(body), [class*='sm0']:not(body)").length) {
                      cards = cards.not($(this));
                    }
                  });
                  gsap.to(cards, { ...sectionModes[`sectionMode${modeIndex}`][`cardMode${i}`], duration: durationSetting, ease: easeSetting });
                }
              });
            }
          }
        });
      }
    });
  }
});
