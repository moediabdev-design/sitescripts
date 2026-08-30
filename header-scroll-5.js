window.onload = function() {
  // Move the mobile menu elements to be direct children of <body>.
  // This escapes any transformed ancestor Squarespace's template wrapper
  // might apply, which is a known cause of position:fixed breaking on iOS Safari.
  var menuToggle = document.getElementById('mobile-menu-toggle');
  var menuDropdown = document.getElementById('mobile-menu-dropdown');

  if (menuToggle && menuToggle.parentElement !== document.body) {
    document.body.appendChild(menuToggle);
  }
  if (menuDropdown && menuDropdown.parentElement !== document.body) {
    document.body.appendChild(menuDropdown);
  }

  // Smooth the hide/show of the hamburger icon
  if (menuToggle) {
    menuToggle.style.transition = 'top 0.3s ease';
  }

  var debugBox = document.getElementById('debug-box');
  var header = document.getElementById('site-header-desktop');
  var lastY = window.pageYOffset;
  var hidden = false;
  var scrollAccumulator = 0; // tracks cumulative downward scroll since last reset

  var HIDE_THRESHOLD = 80; // <-- tweak this: pixels of downward scroll needed before hiding

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

  // Hide both the desktop header and the hamburger immediately when jumping
  // to an in-page anchor (portfolio/skills), instead of waiting for the
  // scroll listener to catch it.
  var anchorLinks = document.querySelectorAll('a.nav-link[href="/#portfolio"], a.nav-link[href="/#skills"]');
  for (var j = 0; j < anchorLinks.length; j++) {
    anchorLinks[j].addEventListener('click', function() {
      hidden = true;
      scrollAccumulator = 0;
      applyHiddenState();
      // Sync lastY so the scroll listener doesn't immediately re-show it
      // based on a stale delta once the jump/scroll finishes.
      setTimeout(function() {
        lastY = window.pageYOffset;
      }, 50);
    });
  }
};
