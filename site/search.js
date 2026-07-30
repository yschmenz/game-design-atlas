/* Global atlas search — a /-anywhere overlay over the build-time index.
   Data comes from search-index.js (window.SEARCH_INDEX); links are prefixed
   with window.SEARCH_BASE so they resolve from any page depth. */
(function () {
  var INDEX = window.SEARCH_INDEX || [];
  var BASE = window.SEARCH_BASE || '';

  var ov = document.createElement('div');
  ov.className = 'search-ov';
  ov.hidden = true;
  ov.innerHTML =
    '<div class="search-ov-box" role="dialog" aria-label="Search the atlas">' +
    '<input class="search-ov-input" type="search" autocomplete="off" spellcheck="false" ' +
    'placeholder="search everything — games, entries, topics, patterns">' +
    '<ul class="search-ov-results"></ul>' +
    '<p class="search-ov-hint">↑↓ to move · ↵ to open · esc to close</p>' +
    '</div>';
  document.body.appendChild(ov);
  var input = ov.querySelector('.search-ov-input');
  var list = ov.querySelector('.search-ov-results');
  var cur = [], sel = 0;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function run(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var toks = q.split(/\s+/), out = [];
    for (var i = 0; i < INDEX.length; i++) {
      var r = INDEX[i], ok = true;
      for (var t = 0; t < toks.length; t++) { if (r.x.indexOf(toks[t]) < 0) { ok = false; break; } }
      if (!ok) continue;
      var sc = 0, tl = r.t.toLowerCase();
      for (var t2 = 0; t2 < toks.length; t2++) { if (tl.indexOf(toks[t2]) >= 0) sc += 3; }
      if (tl.indexOf(q) >= 0) sc += 2;
      out.push([sc, r]);
    }
    out.sort(function (a, b) { return b[0] - a[0] || a[1].t.localeCompare(b[1].t); });
    return out.slice(0, 25).map(function (o) { return o[1]; });
  }

  function render(items) {
    cur = items; sel = 0;
    list.innerHTML = items.map(function (r, i) {
      var src = r.img ? (r.img.indexOf('http') === 0 ? r.img : BASE + r.img) : '';
      var cover = src
        ? '<img class="so-cover" src="' + src + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">'
        : '<span class="so-cover so-cover-none"></span>';
      return '<li class="search-ov-item' + (i === 0 ? ' on' : '') + '" data-u="' + esc(r.u) + '">' + cover +
        '<span class="so-main"><span class="so-t">' + esc(r.t) + '</span>' +
        '<span class="so-k">' + esc(r.k) + (r.c ? ' · ' + esc(r.c) : '') + '</span></span></li>';
    }).join('');
  }

  function paint() {
    var lis = list.children;
    for (var i = 0; i < lis.length; i++) lis[i].classList.toggle('on', i === sel);
    if (lis[sel]) lis[sel].scrollIntoView({ block: 'nearest' });
  }

  function go(i) { if (cur[i]) location.href = BASE + cur[i].u; }
  function open() { ov.hidden = false; input.value = ''; render([]); input.focus(); }
  function close() { ov.hidden = true; }

  input.addEventListener('input', function () { render(run(input.value)); });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('li'); if (li) location.href = BASE + li.dataset.u;
  });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

  var openers = document.querySelectorAll('[data-open-search]');
  for (var o = 0; o < openers.length; o++) openers[o].addEventListener('click', open);

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === '/' && ov.hidden && !typing) { e.preventDefault(); open(); return; }
    if (ov.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, cur.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
  });
})();
