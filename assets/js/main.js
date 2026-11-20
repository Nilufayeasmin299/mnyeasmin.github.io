(function () {
  'use strict';

  // Email: the page ships "user [at] domain [dot] tld"; build the real mailto: link here.
  document.querySelectorAll('a.js-email').forEach(function (link) {
    var address = link.dataset.user + '@' + link.dataset.domain;
    link.href = 'mailto:' + address;
    var text = link.querySelector('.js-email-text');
    if (text) text.textContent = link.dataset.label || address;
  });
})();
