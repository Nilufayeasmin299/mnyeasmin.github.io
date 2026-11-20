(function () {
  'use strict';

  // Email: the page ships "user [at] domain [dot] tld"; build the real mailto: link here.
  document.querySelectorAll('a.js-email').forEach(function (link) {
    var address = link.dataset.user + '@' + link.dataset.domain;
    link.href = 'mailto:' + address;
    var text = link.querySelector('.js-email-text');
    if (text) text.textContent = link.dataset.label || address;
  });

  // BibTeX: shown as plain text without JavaScript; with it, hidden behind a toggle with a copy button.
  document.querySelectorAll('.pub .bib').forEach(function (bib) {
    var toggle = bib.closest('.pub').querySelector('.bib-toggle');
    var copy = bib.querySelector('.bib-copy');
    if (!toggle) return;
    bib.hidden = true;
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      var opening = bib.hidden;
      bib.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
    });
    if (copy && navigator.clipboard) {
      copy.hidden = false;
      copy.addEventListener('click', function () {
        var label = copy.querySelector('span');
        navigator.clipboard.writeText(bib.querySelector('pre').textContent).then(function () {
          label.textContent = 'Copied';
          setTimeout(function () { label.textContent = 'Copy'; }, 1500);
        });
      });
    }
  });
})();
