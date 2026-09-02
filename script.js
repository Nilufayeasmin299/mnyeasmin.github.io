document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.primary');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }
});
