/* Image-reveal recovery for the editorial preview only. */
(() => {
  "use strict";

  function installImageRevealRecovery() {
    if (document.body?.dataset.editorialVersion !== "20261026") return;

    const secret = document.getElementById("secret");
    if (!secret || secret.dataset.imageRevealRecovery === "ready") return;
    secret.dataset.imageRevealRecovery = "ready";

    const pendingSelector = ".secrets-panel img.zero-secret-image.is-content-pending";
    const recoveryTimers = new Map();
    let scheduledFrame = 0;

    function needsRecovery(image) {
      if (
        document.hidden ||
        !image.isConnected ||
        !image.matches(pendingSelector) ||
        image.classList.contains("is-content-entering") ||
        !image.complete ||
        !image.naturalWidth ||
        image.closest("[hidden]")
      ) return false;

      const panel = image.closest(".secrets-panel");
      // The expanding panel clips its children until its height animation ends.
      if (!panel || panel.classList.contains("is-animating")) return false;

      const imageRect = image.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportBottom = window.innerHeight * 0.94;
      return imageRect.width > 0 && imageRect.height > 0 &&
        Math.min(imageRect.bottom, panelRect.bottom, viewportBottom) >
          Math.max(imageRect.top, panelRect.top, 0) &&
        Math.min(imageRect.right, panelRect.right, viewportWidth) >
          Math.max(imageRect.left, panelRect.left, 0);
    }

    function checkVisibleImages() {
      scheduledFrame = 0;
      for (const [image, timer] of recoveryTimers) {
        if (!needsRecovery(image)) {
          window.clearTimeout(timer);
          recoveryTimers.delete(image);
        }
      }

      secret.querySelectorAll(pendingSelector).forEach((image) => {
        if (!needsRecovery(image) || recoveryTimers.has(image)) return;

        // Give the shared IntersectionObserver time to start the normal reveal.
        // A zero-area intersection in a collapsed panel can otherwise leave an
        // already-loaded image pending until it exits and re-enters the viewport.
        const timer = window.setTimeout(() => {
          recoveryTimers.delete(image);
          if (!needsRecovery(image)) return;
          image.classList.remove("is-content-pending");
          image.classList.add("is-content-shown");
        }, 200);
        recoveryTimers.set(image, timer);
      });
    }

    function scheduleCheck() {
      if (!scheduledFrame) scheduledFrame = requestAnimationFrame(checkVisibleImages);
    }

    // Covers click/keyboard opening, hash restoration, breakpoint changes, and
    // completion of the existing panel animation without changing that code.
    const observer = new MutationObserver((records) => {
      if (records.some(({ target }) => target.matches(
        ".secrets-panel, .secrets-toggle, img.zero-secret-image"
      ))) scheduleCheck();
    });
    observer.observe(secret, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "aria-expanded"]
    });

    secret.addEventListener("load", scheduleCheck, true);
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });
    window.addEventListener("pageshow", scheduleCheck);
    document.addEventListener("visibilitychange", scheduleCheck);
    scheduleCheck();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installImageRevealRecovery, { once: true });
  } else {
    installImageRevealRecovery();
  }
})();
