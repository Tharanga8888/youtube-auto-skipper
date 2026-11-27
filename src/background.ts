
type SkipClickMessage = {
  type: "AUTO_SKIP_CLICK";
  x: number;
  y: number;
};

const activeTabs = new Set<number>();

chrome.runtime.onMessage.addListener(
  (message: SkipClickMessage, sender, sendResponse) => {
    if (
      message?.type !== "AUTO_SKIP_CLICK" ||
      typeof sender.tab?.id !== "number"
    ) {
      return;
    }

    const tabId = sender.tab.id;

    if (activeTabs.has(tabId)) {
      sendResponse({ ok: false, error: "Click already in progress" });
      return;
    }

    activeTabs.add(tabId);

    const target = { tabId };

    void (async () => {
      let attached = false;

      try {
        await chrome.debugger.attach(target, "1.3");
        attached = true;

        await chrome.debugger.sendCommand(
          target,
          "Input.dispatchMouseEvent",
          {
            type: "mouseMoved",
            x: message.x,
            y: message.y
          }
        );

        await chrome.debugger.sendCommand(
          target,
          "Input.dispatchMouseEvent",
          {
            type: "mousePressed",
            x: message.x,
            y: message.y,
            button: "left",
            buttons: 1,
            clickCount: 1
          }
        );

        await chrome.debugger.sendCommand(
          target,
          "Input.dispatchMouseEvent",
          {
            type: "mouseReleased",
            x: message.x,
            y: message.y,
            button: "left",
            buttons: 0,
            clickCount: 1
          }
        );

        console.info("Auto Skipper: CDP mouse click dispatched.");
        sendResponse({ ok: true });
      } catch (error) {
        console.error("Auto Skipper: Debugger click failed.", error);
        sendResponse({ ok: false, error: String(error) });
      } finally {
        if (attached) {
          try {
            await chrome.debugger.detach(target);
          } catch (error) {
            console.warn("Auto Skipper: Debugger detach failed.", error);
          }
        }

        activeTabs.delete(tabId);
      }
    })();

    return true;
  }
);
