// Runs immediately as this script executes (does NOT wait for window.onload,
// which only fires once every image/asset on the page has finished loading).
// If we're arriving here via a portfolio/skills link clicked from another
// page, the header markup is already in the DOM at this point (it's part of
// this same injected snippet, parsed before this script tag), so we can
// hide it right away instead of waiting for the full page load.
(function() {
  var incomingAnchorHashes = ['#portfolio', '#skills'];
  if (incomingAnchorHashes.indexOf(window.location.hash) === -1) {
    return;
  }

  var earlyHeader = document.getElementById('site-header-desktop');
  if (earlyHeader) {
    earlyHeader.style.top = '-150px';
  }

  var earlyToggle = document.getElementById('mobile-menu-toggle');
  if (earlyToggle && !earlyToggle.classList.contains('open')) {
    earlyToggle.style.top = '-80px';
  }
})();

window.onload = function() {
  var MAX_Z = 2147483647;

  // Move the header + mobile menu elements to be direct children of <body>.
  // This escapes any transformed/positioned ancestor Squarespace's template
  // wrapper might apply — a known cause of both position:fixed breaking on
  // iOS Safari AND z-index losing to sibling sections (stacking context).
  var header = document.getElementById('site-header-desktop');
  var menuToggle = document.getElementById('mobile-menu-toggle');
  var menuDropdown = document.getElementById('mobile-menu-dropdown');

  function portalToBody(el) {
    if (!el) return;
    if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
    el.style.zIndex = MAX_Z;
  }

  portalToBody(header);
  portalToBody(menuToggle);
  portalToBody(menuDropdown);

  // Keep the header pinned as a body child even if Squarespace injects
  // other elements (cookie banners, announcement bars, popups) directly
  // into <body> later and they happen to out-stack it.
  if (window.MutationObserver && header) {
    var stackObserver = new MutationObserver(function() {
      portalToBody(header);
      portalToBody(menuToggle);
      portalToBody(menuDropdown);
    });
    stackObserver.observe(document.body, { childList: true });
  }

  // Smooth the hide/show of the hamburger icon
  if (menuToggle) {
    menuToggle.style.transition = 'top 0.3s ease';
  }

  var debugBox = document.getElementById('debug-box');
  var lastY = window.pageYOffset;
  var hidden = false;
  var scrollAccumulator = 0; // tracks cumulative downward scroll since last reset

  var HIDE_THRESHOLD = 145; // <-- tweak this: pixels of downward scroll needed before hiding

  // Used to detect when an anchor-triggered smooth-scroll has finished moving
  var isAnchorScrolling = false;
  var anchorScrollCheckY = null;

  function applyHiddenState() {
    if (header) {
      header.style.top = hidden ? '-150px' : '0px';
    }
    // Don't hide the hamburger while its own menu is open
    if (menuToggle && !menuToggle.classList.contains('open')) {
      menuToggle.style.top = hidden ? '-80px' : '20px';
    }
  }

  setInterval(function() {
    var y = window.pageYOffset;

    // While an anchor-triggered scroll is in progress, ignore normal
    // hide/show logic entirely and just watch for the page to stop moving.
    if (isAnchorScrolling) {
      if (debugBox) {
        debugBox.textContent = 'y=' + y + ' (waiting for anchor scroll to settle)';
      }

      if (y === anchorScrollCheckY) {
        // No movement since the last check — scroll has settled.
        // Header is already hidden (set at click time); just hand control
        // back to the normal scroll logic from here on.
        isAnchorScrolling = false;
        scrollAccumulator = 0;
        lastY = y;
      } else {
        anchorScrollCheckY = y;
      }
      return;
    }

    var delta = y - lastY;

    if (debugBox) {
      debugBox.textContent = 'y=' + y + ' delta=' + delta.toFixed(1) + ' accum=' + scrollAccumulator.toFixed(1) + ' hidden=' + hidden;
    }

    if (y <= 10) {
      hidden = false;
      scrollAccumulator = 0;
    } else if (delta > 0) {
      // scrolling down — accumulate distance
      scrollAccumulator += delta;
      if (scrollAccumulator > HIDE_THRESHOLD) {
        hidden = true;
      }
    } else if (delta < 0) {
      // scrolling up — reset immediately and show
      hidden = false;
      scrollAccumulator = 0;
    }

    applyHiddenState();
    lastY = y;
  }, 100);

  // Mobile menu toggle
  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function() {
      var isOpen = menuToggle.classList.toggle('open');
      menuDropdown.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      // If opening while the icon happened to be hidden, snap it back into view
      if (isOpen) {
        menuToggle.style.top = '20px';
      }
    });

    // Close the menu when any link inside it is clicked
    var dropdownLinks = menuDropdown.querySelectorAll('a');
    for (var i = 0; i < dropdownLinks.length; i++) {
      dropdownLinks[i].addEventListener('click', function() {
        menuToggle.classList.remove('open');
        menuDropdown.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        applyHiddenState();
      });
    }

    // Keyboard support (Enter/Space) since the button has tabindex="0"
    menuToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuToggle.click();
      }
    });
  }

  // When jumping to an in-page anchor (portfolio/skills) FROM THE HOME PAGE
  // ITSELF, hide the header immediately and suppress the normal scroll
  // listener for the duration of the jump — original, unmodified behavior.
  // Clicking these links here doesn't reload the page (same-page hash
  // change), so this is all that's needed for this case.
  var anchorLinks = document.querySelectorAll('a.nav-link[href="/#portfolio"], a.nav-link[href="/#skills"]');
  for (var j = 0; j < anchorLinks.length; j++) {
    anchorLinks[j].addEventListener('click', function() {
      var href = this.getAttribute('href');
      var linkUrl = new URL(href, window.location.origin);

      // Only hide right away if this click keeps us on the same page
      // (i.e. we're already on the home page). If the link's path differs
      // from where we currently are, this is a cross-page navigation —
      // do nothing here and let the on-load hash check (below) handle
      // hiding the header once the home page has actually loaded.
      if (linkUrl.pathname !== window.location.pathname) {
        return;
      }

      hidden = true;
      applyHiddenState();
      isAnchorScrolling = true;
      anchorScrollCheckY = window.pageYOffset;
    });
  }

  // Clicking the same links from ANY OTHER page triggers a real page
  // navigation to the home page with the hash still attached (e.g.
  // "/#portfolio"), and the browser handles that navigation + anchor jump
  // entirely on its own — we don't touch the click for that case at all.
  // What we DO need is to hide the header once we land here, in sync with
  // that jump. We detect it simply: if the URL we loaded already has one of
  // these hashes in it, we just arrived via that flow. Hide the header and
  // hand off to the same isAnchorScrolling logic used above so it releases
  // control once the page settles.
  var incomingAnchorHashes = ['#portfolio', '#skills'];
  if (incomingAnchorHashes.indexOf(window.location.hash) !== -1) {
    hidden = true;
    applyHiddenState();
    isAnchorScrolling = true;
    anchorScrollCheckY = window.pageYOffset;
  }
};
