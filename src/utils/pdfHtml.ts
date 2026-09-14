const SKIPPED_COMPUTED_STYLE_PROPERTIES = new Set([
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "visibility",
]);

const buildComputedStyleText = (element: Element) => {
  const computedStyle = window.getComputedStyle(element);
  const styles: string[] = [];

  for (let index = 0; index < computedStyle.length; index += 1) {
    const propertyName = computedStyle.item(index);

    if (SKIPPED_COMPUTED_STYLE_PROPERTIES.has(propertyName)) {
      continue;
    }

    const propertyValue = computedStyle.getPropertyValue(propertyName);

    if (!propertyValue) {
      continue;
    }

    const priority = computedStyle.getPropertyPriority(propertyName);
    styles.push(
      `${propertyName}: ${propertyValue}${priority ? " !important" : ""}`,
    );
  }

  return styles.join(";");
};

const inlineComputedStyles = (source: Element, target: Element) => {
  const existingStyle = target.getAttribute("style");
  const computedStyle = buildComputedStyleText(source);
  target.setAttribute(
    "style",
    [existingStyle, computedStyle, "visibility: visible !important"]
      .filter(Boolean)
      .join(";"),
  );

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children.item(index);

    if (targetChild) {
      inlineComputedStyles(sourceChild, targetChild);
    }
  });
};

export const getElementHtmlWithComputedStyles = (element: HTMLElement) => {
  const clonedElement = element.cloneNode(true) as HTMLElement;
  inlineComputedStyles(element, clonedElement);

  return clonedElement.innerHTML;
};
