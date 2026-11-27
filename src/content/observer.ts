
import { findSkipButton } from "./skipDetector";

let playerObserver: MutationObserver | null = null;
let documentObserver: MutationObserver | null = null;
let currentPlayer: HTMLElement | null = null;
let checkTimer: number | undefined;

const attemptedButtons = new WeakSet<HTMLElement>();

function checkForSkipButton(): void {
  const button = findSkipButton();

  if (!button || attemptedButtons.has(button)) {
    return;
  }

  // Prevent repeated attempts for this exact button.
  attemptedButtons.add(button);

  const rect = button.getBoundingClientRect();

  console.info("Auto Skipper: Skip button detected. Attempting click.");

  chrome.runtime
    .sendMessage({
      type: "AUTO_SKIP_CLICK",
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    .then((response) => {
      if (response?.ok) {
        console.info("Auto Skipper: Click request completed.");
      } else {
        console.warn("Auto Skipper: Click request failed.", response);
      }
    })
    .catch((error) => {
      console.error("Auto Skipper: Message failed.", error);
    });
}

function scheduleCheck(): void {
  if (checkTimer !== undefined) {
    return;
  }

  checkTimer = window.setTimeout(() => {
    checkTimer = undefined;
    checkForSkipButton();
  }, 150);
}

function observePlayer(player: HTMLElement): void {
  playerObserver?.disconnect();

  currentPlayer = player;

  playerObserver = new MutationObserver(scheduleCheck);

  playerObserver.observe(player, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "class",
      "style",
      "disabled",
      "aria-disabled",
    ],
  });

  console.info("Auto Skipper: Watching YouTube player.");

  scheduleCheck();
}

export function startSkipObserver(): void {
  if (!document.documentElement) {
    return;
  }

  const initialPlayer = document.querySelector<HTMLElement>(
    ".html5-video-player"
  );

  if (initialPlayer) {
    observePlayer(initialPlayer);
  }

  // Detect when YouTube replaces the player during navigation.
  documentObserver = new MutationObserver((records) => {
    const changesOutsidePlayer = records.some(
      (record) =>
        !currentPlayer || !currentPlayer.contains(record.target)
    );

    if (!changesOutsidePlayer) {
      return;
    }

    const newPlayer = document.querySelector<HTMLElement>(
      ".html5-video-player"
    );

    if (newPlayer && newPlayer !== currentPlayer) {
      observePlayer(newPlayer);
    }
  });

  documentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  console.info("Auto Skipper: Observer started.");
}
