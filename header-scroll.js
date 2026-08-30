window.onload = function() {
  var debugBox = document.getElementById('debug-box');
  var header = document.getElementById('site-header-desktop');
  var lastY = window.pageYOffset;
  var hidden = false;

  setInterval(function() {
    var y = window.pageYOffset;
    var delta = y - lastY;

    if (debugBox) {
      debugBox.textContent = 'y=' + y + ' delta=' + delta.toFixed(1) + ' hidden=' + hidden;
    }

    if (y <= 10) {
      hidden = false;
    } else if (delta > 5) {
      hidden = true;
    } else if (delta < -5) {
      hidden = false;
    }

    if (header) {
      header.style.top = hidden ? '-150px' : '0px';
    }

    if (Math.abs(delta) > 2) {
      lastY = y;
    }
  }, 100);

  // Mobile menu toggle
  var menuToggle = document.getElementById('mobile-menu-toggle');
  var menuDropdown = document.getElementById('mobile-menu-dropdown');

  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function() {
      var isOpen = menuToggle.classList.toggle('open');
      menuDropdown.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen); // added: locks scroll per your CSS
    });

    // Close the menu when any link inside it is clicked
    var dropdownLinks = menuDropdown.querySelectorAll('a');
    for (var i = 0; i < dropdownLinks.length; i++) {
      dropdownLinks[i].addEventListener('click', function() {
        menuToggle.classList.remove('open');
        menuDropdown.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open'); // added
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
};
