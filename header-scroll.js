window.onload = function() {
  var desktopHeader = document.getElementById('site-header-desktop');
  var mobileHeader = document.getElementById('site-header-mobile');
  var lastY = window.pageYOffset;
  var hidden = false;
  var revealPoint = 150; // how far down the page before hide/show behavior starts

  setInterval(function() {
    var y = window.pageYOffset;
    var delta = y - lastY;

    if (y <= revealPoint) {
      hidden = false;
    } else if (delta > 5) {
      hidden = true;
    } else if (delta < -5) {
      hidden = false;
    }

    if (desktopHeader) desktopHeader.style.top = hidden ? '-150px' : '0px';
    if (mobileHeader) mobileHeader.style.top = hidden ? '-90px' : '0px';

    if (Math.abs(delta) > 2) lastY = y;
  }, 100);
};
