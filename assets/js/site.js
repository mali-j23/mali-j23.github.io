// Resume print button, copy buttons, certificate filter and viewer.
// No tracking, no external calls.
(function () {
  var printBtn = document.querySelector('[data-print]');
  if (printBtn && typeof window.print === 'function') {
    printBtn.hidden = false;
    printBtn.addEventListener('click', function () { window.print(); });
  }

  var status = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var say = function (label, msg) {
        btn.textContent = label;
        btn.classList.toggle('done', label === 'Copied');
        if (status) status.textContent = msg;
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { say('Copied', text + ' copied to clipboard'); },
          function () { say('Select it', 'Copy is blocked here. Select the address to copy it.'); }
        );
      } else {
        say('Select it', 'Copy is not available here. Select the address to copy it.');
      }
    });
  });

  var chips = document.querySelectorAll('.cert-filter .chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      document.querySelectorAll('.cert').forEach(function (card) {
        card.hidden = !(f === 'all' || card.getAttribute('data-group') === f);
      });
    });
  });

  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('img'), cap = dlg.querySelector('.lb-cap'), opener = null;
    document.querySelectorAll('[data-full]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        opener = a;
        img.src = a.getAttribute('data-full');
        img.alt = 'Certificate: ' + a.getAttribute('data-caption');
        cap.textContent = a.getAttribute('data-caption');
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  }
})();
