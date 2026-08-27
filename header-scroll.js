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
};
