(function () {
  var overlay = document.getElementById('p5-transition-overlay');
  if (!overlay) return;

  var TRANSITION_MS = 480; // match the CSS transition duration

  function reveal() {
    overlay.classList.add('leaving');
  }

  if (document.readyState === 'complete') {
    reveal();
  } else {
    window.addEventListener('load', reveal);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank') return;

    var isInternal = href.startsWith('/') || href.indexOf(window.location.hostname) !== -1;
    if (!isInternal) return;

    e.preventDefault();
    overlay.classList.remove('leaving');

    setTimeout(function () {
      window.location.href = href;
    }, TRANSITION_MS);
  });
})();
