(function () {
  // Build the overlay once
  var overlay = document.createElement('div');
  overlay.id = 'p5-transition-overlay';
  overlay.innerHTML = '<div class="slash one"></div><div class="slash two"></div>';
  document.body.appendChild(overlay);

  var TRANSITION_MS = 480; // roughly match your CSS transition duration

  // Play "reveal" animation once the page (including images) has fully loaded
  function playReveal() {
    overlay.classList.add('covering');
    // force reflow so the browser registers the starting state
    void overlay.offsetWidth;
    requestAnimationFrame(function () {
      overlay.classList.add('revealing');
      overlay.classList.remove('covering');
    });
    setTimeout(function () {
      overlay.classList.remove('revealing');
    }, TRANSITION_MS);
  }

  window.addEventListener('load', playReveal);

  // Intercept internal link clicks to play "cover" animation before navigating
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank') return;

    // Only intercept same-site links
    var isInternal = href.startsWith('/') || href.indexOf(window.location.hostname) !== -1;
    if (!isInternal) return;

    e.preventDefault();
    overlay.classList.add('covering');

    setTimeout(function () {
      window.location.href = href;
    }, TRANSITION_MS);
  });
})();
