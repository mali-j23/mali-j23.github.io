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
        img.alt = a.getAttribute('data-alt') || ('Certificate: ' + a.getAttribute('data-caption'));
        cap.textContent = a.getAttribute('data-caption');
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  }
})();

// Stroke data explorer: switch subtype, morph the chart, read values on hover.
(function () {
  var root = document.querySelector('[data-explorer]');
  if (!root) return;
  var cfg = JSON.parse(root.querySelector('.xp-data').textContent);
  var G = cfg.g, svg = root.querySelector('.xp-svg'), tip = root.querySelector('.xp-tip');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var cur = { key: 'isch', ct: cfg.sets.isch.ct.slice(), us: cfg.sets.isch.us.slice(), max: cfg.sets.isch.max };
  var px = function (i) { return G.x0 + i * (G.x1 - G.x0) / 6; };
  var py = function (v, mx) { return G.y0 - (v / mx) * (G.y0 - G.y1); };
  var VW = G.W, mq = window.matchMedia ? window.matchMedia('(max-width: 620px)') : null;
  function fitView() { VW = mq && mq.matches ? G.x1 + 22 : G.W; svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + G.H); }
  fitView(); if (mq) { if (mq.addEventListener) mq.addEventListener('change', fitView); else if (mq.addListener) mq.addListener(fitView); }
  var ctLine = svg.querySelector('polyline.ct'), usLine = svg.querySelector('polyline.us');
  var ctPts = svg.querySelectorAll('.ct-pt'), usPts = svg.querySelectorAll('.us-pt');
  var labs = svg.querySelectorAll('.end-labs text'), ticksG = svg.querySelector('.ticks');

  function draw(ct, us, mx, step) {
    var p = function (a) { return a.map(function (v, i) { return px(i).toFixed(1) + ',' + py(v, mx).toFixed(1); }).join(' '); };
    ctLine.setAttribute('points', p(ct)); usLine.setAttribute('points', p(us));
    ct.forEach(function (v, i) { ctPts[i].setAttribute('cy', py(v, mx).toFixed(1)); });
    us.forEach(function (v, i) { usPts[i].setAttribute('cy', py(v, mx).toFixed(1)); });
    var cy = py(ct[6], mx), uy = py(us[6], mx);
    if (Math.abs(cy - uy) < 46) { var m = (cy + uy) / 2; if (cy > uy) { cy = m + 23; uy = m - 23; } else { cy = m - 23; uy = m + 23; } }
    labs[0].setAttribute('y', (uy - 2).toFixed(1)); labs[1].setAttribute('y', (uy + 16).toFixed(1));
    labs[2].setAttribute('y', (cy - 2).toFixed(1)); labs[3].setAttribute('y', (cy + 16).toFixed(1));
    if (step) {
      while (ticksG.firstChild) ticksG.removeChild(ticksG.firstChild);
      for (var v = 0; v <= step.max; v += step.step) {
        var g = document.createElementNS(NS, 'g'), l = document.createElementNS(NS, 'line'), t = document.createElementNS(NS, 'text');
        var y = py(v, mx);
        l.setAttribute('class', 'grid'); l.setAttribute('x1', G.x0); l.setAttribute('x2', G.x1); l.setAttribute('y1', y); l.setAttribute('y2', y);
        t.setAttribute('class', 'axis-t'); t.setAttribute('x', G.x0 - 10); t.setAttribute('y', y + 4.5); t.setAttribute('text-anchor', 'end'); t.textContent = v;
        if (y < G.y1 - 4) { g.style.opacity = 0; }
        g.appendChild(l); g.appendChild(t); ticksG.appendChild(g);
      }
    }
  }

  function setPanel(d) {
    root.querySelectorAll('[data-f]').forEach(function (el) { el.textContent = d[el.getAttribute('data-f')]; });
    var lt = svg.querySelectorAll('.end-labs .lab-s');
    lt[0].textContent = d.usApc; lt[1].textContent = d.ctApc;
    svg.querySelector('title').textContent = 'Age-adjusted ' + d.name.toLowerCase() + ' death rates, Connecticut and the United States, 2018 to 2024';
    svg.querySelector('desc').textContent = 'Connecticut ' + d.ct[0] + ' to ' + d.ct[6] + ' per 100,000 (' + d.ctApc + '); United States ' + d.us[0] + ' to ' + d.us[6] + ' (' + d.usApc + '). Full values in the table below the chart.';
  }

  function go(key) {
    var d = cfg.sets[key]; if (!d || key === cur.key) return;
    var from = { ct: cur.ct.slice(), us: cur.us.slice(), max: cur.max };
    cur.key = key; setPanel(d);
    root.querySelectorAll('.xp-tab').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-key') === key ? 'true' : 'false'); });
    hideTip();
    if (reduce) { cur.ct = d.ct.slice(); cur.us = d.us.slice(); cur.max = d.max; draw(cur.ct, cur.us, cur.max, d); return; }
    var t0 = null, dur = 750;
    function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      var lerp = function (a, b) { return a + (b - a) * e; };
      cur.ct = from.ct.map(function (v, i) { return lerp(v, d.ct[i]); });
      cur.us = from.us.map(function (v, i) { return lerp(v, d.us[i]); });
      cur.max = lerp(from.max, d.max);
      draw(cur.ct, cur.us, cur.max, d);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  root.querySelectorAll('.xp-tab').forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-key')); });
  });

  // Hover or tap: nearest year, both values
  var hline = svg.querySelector('.hover-line'), hit = svg.querySelector('.hit');
  function hideTip() { tip.hidden = true; svg.classList.remove('is-hover'); svg.querySelectorAll('circle.on').forEach(function (c) { c.classList.remove('on'); }); }
  function showAt(ev) {
    var r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) * (VW / r.width);
    var i = Math.max(0, Math.min(6, Math.round((sx - G.x0) / ((G.x1 - G.x0) / 6))));
    var d = cfg.sets[cur.key], x = px(i);
    hline.setAttribute('x1', x); hline.setAttribute('x2', x); svg.classList.add('is-hover');
    svg.querySelectorAll('circle.on').forEach(function (c) { c.classList.remove('on'); });
    ctPts[i].classList.add('on'); usPts[i].classList.add('on');
    tip.innerHTML = '<b>' + cfg.years[i] + '</b><span class="c">Connecticut ' + d.ct[i].toFixed(1) + '</span><br>United States ' + d.us[i].toFixed(1);
    var top = Math.min(py(d.ct[i], d.max), py(d.us[i], d.max));
    tip.style.left = Math.max(12, Math.min(88, x / VW * 100)) + '%'; tip.style.top = ((top - 14) / G.H * r.height) + 'px';
    tip.hidden = false;
  }
  hit.addEventListener('pointermove', showAt);
  hit.addEventListener('pointerdown', showAt);
  hit.addEventListener('pointerleave', hideTip);

  // Draw the lines in once, the first time the chart comes into view
  if (!reduce && 'IntersectionObserver' in window) {
    [ctLine, usLine].forEach(function (l) { var n = Math.ceil(l.getTotalLength()); l.style.setProperty('--len', n); });
    root.classList.add('is-pending');
    var drawn = false;
    function reveal() {
      if (drawn) return; drawn = true; io.disconnect();
      root.classList.add('is-drawn');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.remove('is-pending');
        setTimeout(function () { [ctLine, usLine].forEach(function (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; }); usLine.removeAttribute('style'); ctLine.removeAttribute('style'); root.classList.remove('is-drawn'); }, 1700);
      }); });
    }
    var io = new IntersectionObserver(function (es) {
      var e = es[0];
      if (e.isIntersecting || e.boundingClientRect.top < 0) reveal();
    }, { threshold: 0.35 });
    io.observe(root);
    setTimeout(function () { var r = root.getBoundingClientRect(); if (r.top < window.innerHeight) reveal(); }, 3000);
  }
})();

/* Publication page: highlight the author name when it scrolls into view; magnifier follows the mouse */
(function () {
  var pp = document.querySelector('.pp');
  if (!pp) return;
  var lp = pp.querySelector('.loupe'), lz = pp.querySelector('.lz'), Z = 3.2;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { pp.classList.add('play'); io.disconnect(); } });
    }, { threshold: 0.6 });
    io.observe(pp);
  } else { pp.classList.add('play'); }
  pp.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    var r = pp.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    lz.style.width = (r.width * Z) + 'px'; lz.style.height = (r.height * Z) + 'px';
    lp.style.left = x + 'px'; lp.style.top = y + 'px';
    var half = lp.offsetWidth / 2;
    lz.style.transform = 'translate(' + (half - x * Z) + 'px,' + (half - y * Z) + 'px)';
    pp.classList.add('lens');
  });
  pp.addEventListener('pointerleave', function () { pp.classList.remove('lens'); });
  pp.addEventListener('click', function () { pp.classList.remove('lens'); });
})();
