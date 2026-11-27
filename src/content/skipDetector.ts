
const SKIP_BUTTON_SELECTORS = [
  ".ytp-skip-ad-button",
  ".ytp-ad-skip-button",
  ".ytp-ad-skip-button-modern",
];

export function findSkipButton(): HTMLElement | null {
  const buttons = document.querySelectorAll<HTMLElement>(
    SKIP_BUTTON_SELECTORS.join(",")
  );

  for (const button of Array.from(buttons)) {
    const style = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();

    const isVisible =
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) > 0 &&
      rect.width > 0 &&
      rect.height > 0;

    const isEnabled =
      !button.hasAttribute("disabled") &&
      button.getAttribute("aria-disabled") !== "true";

    if (isVisible && isEnabled) {
      return button;
    }
  }

  return null;
}
