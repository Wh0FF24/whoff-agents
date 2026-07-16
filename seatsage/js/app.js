/* SeatSage planner. Vanilla JS, no build step. State lives in localStorage. */
(function () {
  "use strict";
  var CFG = window.SEATSAGE_CONFIG || {};
  var LS_KEY = "seatsage:v1";
  var LS_PRO = "seatsage:pro";
  var FLOOR_W = 1600, FLOOR_H = 1200;
  var SVGNS = "http://www.w3.org/2000/svg";

  // ---------- state ----------
  var state = load() || {
    eventName: "",
    eventDate: "",
    guests: [],    // {id, name}
    tables: [],    // {id, name, shape:'round'|'rect', seats, x, y, rot}
    assign: {},    // guestId -> {t: tableId, s: seatIndex}
    nextId: 1
  };
  var ui = {
    zoom: 1,
    selectedTable: null,   // table id
    selectedGuest: null,   // guest id (assign mode)
    pickerSeat: null,      // {tableId, seatIndex}
    search: "",
    unseatedOnly: false
  };

  function isPro() { return localStorage.getItem(LS_PRO) === "1"; }
  function uid() { return state.nextId++; }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch (e) { toast("Could not save. Storage may be full."); }
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.guests) || !Array.isArray(s.tables)) return null;
      s.assign = s.assign || {};
      return s;
    } catch (e) { return null; }
  }
  function mutate(fn) { fn(); save(); render(); }

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    return n;
  }
  function guestById(id) { return state.guests.find(function (g) { return g.id === id; }); }
  function tableById(id) { return state.tables.find(function (t) { return t.id === id; }); }
  function initials(name) {
    var p = name.trim().split(/\s+/);
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  }
  function seatedAt(tableId) {
    var out = [];
    for (var gid in state.assign) {
      var a = state.assign[gid];
      if (a && a.t === tableId) out.push({ gid: Number(gid), s: a.s });
    }
    out.sort(function (a, b) { return a.s - b.s; });
    return out;
  }
  function seatTaken(tableId, seatIndex) {
    return seatedAt(tableId).some(function (o) { return o.s === seatIndex; });
  }
  function firstFreeSeat(t) {
    var taken = {};
    seatedAt(t.id).forEach(function (o) { taken[o.s] = 1; });
    for (var i = 0; i < t.seats; i++) if (!taken[i]) return i;
    return -1;
  }
  function guestTableLabel(gid) {
    var a = state.assign[gid];
    if (!a) return "";
    var t = tableById(a.t);
    return t ? t.name : "";
  }
  var toastTimer = null;
  function toast(msg) {
    var n = $("toast");
    n.textContent = msg; n.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { n.hidden = true; }, 2600);
  }

  // ---------- guest ops ----------
  function canAddGuests(n) {
    if (isPro()) return true;
    return state.guests.length + n <= CFG.FREE_MAX_GUESTS;
  }
  function addGuest(name) {
    name = name.trim();
    if (!name) return false;
    state.guests.push({ id: uid(), name: name });
    return true;
  }
  function removeGuest(gid) {
    state.guests = state.guests.filter(function (g) { return g.id !== gid; });
    delete state.assign[gid];
    if (ui.selectedGuest === gid) ui.selectedGuest = null;
  }
  function assignGuest(gid, tableId, seatIndex) {
    var t = tableById(tableId);
    if (!t) return;
    if (seatIndex == null || seatTaken(tableId, seatIndex)) seatIndex = firstFreeSeat(t);
    if (seatIndex === -1) { toast("“" + t.name + "” is full. Add seats or pick another table."); return; }
    state.assign[gid] = { t: tableId, s: seatIndex };
    toast(guestById(gid).name + " → " + t.name);
  }

  // ---------- table ops ----------
  function canAddTable() { return isPro() || state.tables.length < CFG.FREE_MAX_TABLES; }
  function addTable(shape) {
    if (!canAddTable()) { openUpgrade("You've reached the free plan's " + CFG.FREE_MAX_TABLES + "-table limit."); return; }
    var n = state.tables.length + 1;
    var t = {
      id: uid(),
      name: "Table " + n,
      shape: shape,
      seats: shape === "round" ? 8 : 6,
      x: 200 + (n % 5) * 180,
      y: 160 + Math.floor(n / 5) * 180,
      rot: 0
    };
    state.tables.push(t);
    ui.selectedTable = t.id;
  }
  function deleteTable(tid) {
    state.tables = state.tables.filter(function (t) { return t.id !== tid; });
    for (var gid in state.assign) if (state.assign[gid].t === tid) delete state.assign[gid];
    if (ui.selectedTable === tid) ui.selectedTable = null;
  }
  function setSeats(t, n) {
    n = Math.max(1, Math.min(24, n));
    if (n < t.seats) {
      seatedAt(t.id).forEach(function (o) {
        if (o.s >= n) { delete state.assign[o.gid]; toast(guestById(o.gid).name + " unseated (table shrank)"); }
      });
    }
    t.seats = n;
  }

  // geometry: returns {rx, ry (half-extent), seatPos:[{x,y}]} relative to table center
  function tableGeom(t) {
    var seatR = 9, gap = 15;
    if (t.shape === "round") {
      var ringR = Math.max(44, (t.seats * 24) / (2 * Math.PI) + 14);
      var R = ringR - gap;
      var pos = [];
      for (var i = 0; i < t.seats; i++) {
        var a = (i / t.seats) * 2 * Math.PI - Math.PI / 2;
        pos.push({ x: Math.cos(a) * ringR, y: Math.sin(a) * ringR });
      }
      return { kind: "round", R: R, half: ringR + seatR, seatPos: pos };
    }
    // rect: seats split across two long sides
    var perSide = Math.ceil(t.seats / 2);
    var w = Math.max(70, perSide * 26 + 16), h = 46;
    var pos = [];
    for (var i = 0; i < t.seats; i++) {
      var side = i % 2 === 0 ? -1 : 1; // alternate top/bottom for even fill
      var idx = Math.floor(i / 2);
      var count = side === -1 ? Math.ceil(t.seats / 2) : Math.floor(t.seats / 2);
      var span = w - 20;
      var x = count === 1 ? 0 : -span / 2 + (span / (count - 1)) * idx;
      pos.push({ x: x, y: side * (h / 2 + gap) });
    }
    if (t.rot === 90) {
      pos = pos.map(function (p) { return { x: -p.y, y: p.x }; });
      return { kind: "rect", w: h, h: w, half: Math.max(w, h) / 2 + gap + seatR, seatPos: pos };
    }
    return { kind: "rect", w: w, h: h, half: Math.max(w, h) / 2 + gap + seatR, seatPos: pos };
  }

  // ---------- rendering ----------
  function render() {
    renderHeader();
    renderGuests();
    renderFloor();
    renderInspector();
  }

  function renderHeader() {
    var seated = Object.keys(state.assign).length;
    var cap = state.tables.reduce(function (s, t) { return s + t.seats; }, 0);
    var un = state.guests.length - seated;
    $("stats").innerHTML =
      state.guests.length + " guests · " + state.tables.length + " tables · " + cap + " seats" +
      (un > 0 ? ' · <span class="warn">' + un + " unseated</span>" : (state.guests.length ? " · all seated ✓" : ""));
    $("proBadge").hidden = !isPro();
    $("upgradeBtn").hidden = isPro();
    if (document.activeElement !== $("eventName")) $("eventName").value = state.eventName;
  }

  function renderGuests() {
    var list = $("guestList");
    list.textContent = "";
    var q = ui.search.toLowerCase();
    var shown = 0, unseated = 0;
    state.guests.forEach(function (g) {
      var isUnseated = !state.assign[g.id];
      if (isUnseated) unseated++;
      if (q && g.name.toLowerCase().indexOf(q) === -1) return;
      if (ui.unseatedOnly && !isUnseated) return;
      shown++;
      var li = el("li", { class: "guest-item" + (ui.selectedGuest === g.id ? " selected" : ""), draggable: "true" });
      li.appendChild(el("span", { class: "guest-avatar" }, initials(g.name)));
      li.appendChild(el("span", { class: "gname" }, g.name));
      li.appendChild(el("span", { class: "gtable" }, guestTableLabel(g.id)));
      var del = el("button", { class: "gdel", title: "Remove guest" }, "✕");
      del.addEventListener("click", function (ev) {
        ev.stopPropagation();
        mutate(function () { removeGuest(g.id); });
      });
      li.appendChild(del);
      li.addEventListener("click", function () {
        ui.selectedGuest = ui.selectedGuest === g.id ? null : g.id;
        render();
      });
      li.addEventListener("dragstart", function (ev) {
        ev.dataTransfer.setData("text/seatsage-guest", String(g.id));
        ev.dataTransfer.effectAllowed = "move";
      });
      list.appendChild(li);
    });
    $("guestCount").textContent = state.guests.length ? "(" + state.guests.length + (isPro() ? "" : "/" + CFG.FREE_MAX_GUESTS) + ")" : "";
    $("unseatedCount").textContent = unseated ? "(" + unseated + ")" : "";
    var hint = $("assignHint");
    if (ui.selectedGuest && guestById(ui.selectedGuest)) {
      hint.hidden = false;
      $("assignName").textContent = guestById(ui.selectedGuest).name;
    } else hint.hidden = true;
  }

  function renderFloor() {
    var svg = $("floor");
    svg.textContent = "";
    svg.setAttribute("viewBox", "0 0 " + FLOOR_W + " " + FLOOR_H);
    svg.setAttribute("width", FLOOR_W * ui.zoom);
    svg.setAttribute("height", FLOOR_H * ui.zoom);
    state.tables.forEach(function (t) { svg.appendChild(tableNode(t, false)); });
  }

  function tableNode(t, forExport) {
    var geom = tableGeom(t);
    var g = svgEl("g", { class: "tbl" + (!forExport && ui.selectedTable === t.id ? " selected" : ""), transform: "translate(" + t.x + "," + t.y + ")" });
    g.dataset && (g.dataset.tid = t.id);
    var shape;
    if (geom.kind === "round") shape = svgEl("circle", { class: "tbl-shape", r: geom.R });
    else shape = svgEl("rect", { class: "tbl-shape", x: -geom.w / 2, y: -geom.h / 2, width: geom.w, height: geom.h, rx: 10 });
    g.appendChild(shape);
    var seated = {};
    seatedAt(t.id).forEach(function (o) { seated[o.s] = o.gid; });
    geom.seatPos.forEach(function (p, i) {
      var gid = seated[i];
      g.appendChild(svgEl("circle", { class: "seat" + (gid ? " taken" : ""), cx: p.x, cy: p.y, r: 9 }));
      if (gid) {
        var txt = svgEl("text", { class: "seat-initials", x: p.x, y: p.y + 2.7 });
        txt.textContent = initials(guestById(gid).name);
        g.appendChild(txt);
        var title = svgEl("title");
        title.textContent = guestById(gid).name;
        g.appendChild(title);
      }
    });
    var label = svgEl("text", { class: "tbl-label", y: -2 });
    label.textContent = t.name;
    g.appendChild(label);
    var used = seatedAt(t.id).length;
    var cap = svgEl("text", { class: "tbl-cap" + (used === t.seats ? " full" : ""), y: 13 });
    cap.textContent = used + "/" + t.seats;
    g.appendChild(cap);
    if (!forExport) attachTableEvents(g, t);
    if (forExport) inlineStyles(g);
    return g;
  }

  // drag / tap on tables
  function attachTableEvents(g, t) {
    var drag = null;
    g.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      try { g.setPointerCapture(ev.pointerId); } catch (e) { /* some browsers reject synthetic/stale pointers */ }
      var pt = floorPoint(ev);
      drag = { dx: pt.x - t.x, dy: pt.y - t.y, moved: false, sx: ev.clientX, sy: ev.clientY };
    });
    g.addEventListener("pointermove", function (ev) {
      if (!drag) return;
      if (!drag.moved && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) < 6) return;
      drag.moved = true;
      g.classList.add("dragging");
      var pt = floorPoint(ev);
      var half = tableGeom(t).half;
      t.x = Math.max(half, Math.min(FLOOR_W - half, pt.x - drag.dx));
      t.y = Math.max(half, Math.min(FLOOR_H - half, pt.y - drag.dy));
      g.setAttribute("transform", "translate(" + t.x + "," + t.y + ")");
    });
    g.addEventListener("pointerup", function () {
      if (!drag) return;
      var wasDrag = drag.moved;
      drag = null;
      g.classList.remove("dragging");
      if (wasDrag) { save(); return; }
      // tap: assign selected guest, else open inspector
      if (ui.selectedGuest && guestById(ui.selectedGuest)) {
        mutate(function () {
          assignGuest(ui.selectedGuest, t.id, null);
          ui.selectedGuest = null;
        });
      } else {
        ui.selectedTable = ui.selectedTable === t.id ? null : t.id;
        render();
      }
    });
    g.addEventListener("pointercancel", function () { drag = null; g.classList.remove("dragging"); save(); });
    // HTML5 drop target for guest chips (desktop)
    g.addEventListener("dragover", function (ev) {
      if (ev.dataTransfer.types.indexOf("text/seatsage-guest") !== -1) { ev.preventDefault(); g.classList.add("over"); }
    });
    g.addEventListener("dragleave", function () { g.classList.remove("over"); });
    g.addEventListener("drop", function (ev) {
      ev.preventDefault(); g.classList.remove("over");
      var gid = Number(ev.dataTransfer.getData("text/seatsage-guest"));
      if (gid) mutate(function () { assignGuest(gid, t.id, null); ui.selectedGuest = null; });
    });
  }

  function floorPoint(ev) {
    var svg = $("floor");
    var pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    var m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: ev.clientX, y: ev.clientY };
  }

  function renderInspector() {
    var insp = $("inspector");
    var t = tableById(ui.selectedTable);
    if (!t) { insp.hidden = true; return; }
    insp.hidden = false;
    $("inspTitle").textContent = t.name;
    if (document.activeElement !== $("inspName")) $("inspName").value = t.name;
    $("inspSeats").textContent = t.seats;
    $("rotField").style.display = t.shape === "rect" ? "" : "none";
    var list = $("seatList");
    list.textContent = "";
    var seated = {};
    seatedAt(t.id).forEach(function (o) { seated[o.s] = o.gid; });
    for (var i = 0; i < t.seats; i++) {
      (function (i) {
        var gid = seated[i];
        var li = el("li");
        li.appendChild(el("span", { class: "seat-num" }, String(i + 1)));
        if (gid) {
          li.appendChild(el("span", {}, guestById(gid).name));
          var un = el("button", { class: "unassign", title: "Unseat" }, "✕");
          un.addEventListener("click", function (ev) {
            ev.stopPropagation();
            mutate(function () { delete state.assign[gid]; });
          });
          li.appendChild(un);
        } else {
          li.appendChild(el("span", { class: "empty" }, "empty, tap to seat"));
        }
        li.addEventListener("click", function () { openPicker(t.id, i); });
        list.appendChild(li);
      })(i);
    }
  }

  // ---------- guest picker modal ----------
  function openPicker(tableId, seatIndex) {
    ui.pickerSeat = { tableId: tableId, seatIndex: seatIndex };
    $("pickerTitle").textContent = "Seat " + (seatIndex + 1) + " · " + tableById(tableId).name;
    $("pickerSearch").value = "";
    renderPicker();
    $("pickerModal").hidden = false;
    $("pickerSearch").focus();
  }
  function renderPicker() {
    var list = $("pickerList");
    list.textContent = "";
    var q = $("pickerSearch").value.toLowerCase();
    var items = state.guests.filter(function (g) { return !q || g.name.toLowerCase().indexOf(q) !== -1; });
    // unseated first
    items.sort(function (a, b) {
      var ua = state.assign[a.id] ? 1 : 0, ub = state.assign[b.id] ? 1 : 0;
      return ua - ub || a.name.localeCompare(b.name);
    });
    items.forEach(function (g) {
      var li = el("li");
      li.appendChild(el("span", {}, g.name));
      var lbl = guestTableLabel(g.id);
      if (lbl) li.appendChild(el("span", { class: "ptable" }, "seated: " + lbl));
      li.addEventListener("click", function () {
        var ps = ui.pickerSeat;
        $("pickerModal").hidden = true;
        mutate(function () {
          state.assign[g.id] = { t: ps.tableId, s: ps.seatIndex };
        });
      });
      list.appendChild(li);
    });
    if (!items.length) list.appendChild(el("li", {}, "No guests found. Add some first."));
  }

  // ---------- upgrade / licensing ----------
  function openUpgrade(reason) {
    if (reason) toast(reason);
    $("buyBtn").href = CFG.PAYMENT_URL || "#";
    $("upgradeModal").hidden = false;
  }
  function sha256hex(str) {
    if (window.crypto && crypto.subtle && window.isSecureContext) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
    }
    return Promise.resolve(sha256Fallback(str));
  }
  // minimal pure-JS SHA-256 (for non-secure contexts like file://)
  function sha256Fallback(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), result = "";
    var words = [], asciiBitLength = ascii.length * 8;
    var hash = [], k = [], primeCounter = 0, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while ((ascii.length % 64) - 56) ascii += "\x00";
    for (i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return "";
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, (j += 16)), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25))
          + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
          + (w[i] = i < 16 ? w[i] : (w[i - 16]
            + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? "0" : "") + b.toString(16);
      }
    }
    return result;
  }
  function tryUnlock(code) {
    code = code.trim().toUpperCase();
    return sha256hex(code).then(function (hex) {
      if ((CFG.CODE_HASHES || []).indexOf(hex) !== -1) {
        localStorage.setItem(LS_PRO, "1");
        return true;
      }
      return false;
    });
  }

  // ---------- exports ----------
  function requirePro(feature) {
    if (isPro()) return true;
    openUpgrade(feature + " is a Pro feature.");
    return false;
  }

  function buildPrintSheet() {
    var sheet = $("printSheet");
    sheet.textContent = "";
    sheet.appendChild(el("h1", {}, state.eventName || "Seating Chart"));
    sheet.appendChild(el("p", { class: "pdate" }, "Seating chart · " + new Date().toLocaleDateString()));
    // by table
    sheet.appendChild(el("h2", {}, "Seating by table"));
    var wrap = el("div", { class: "ptables" });
    state.tables.forEach(function (t) {
      var b = el("div", { class: "ptable-block" });
      b.appendChild(el("h3", {}, t.name + " (" + seatedAt(t.id).length + "/" + t.seats + ")"));
      var ol = el("ol");
      seatedAt(t.id).forEach(function (o) {
        ol.appendChild(el("li", {}, guestById(o.gid).name));
      });
      b.appendChild(ol);
      wrap.appendChild(b);
    });
    sheet.appendChild(wrap);
    // alphabetical index
    sheet.appendChild(el("h2", {}, "Find your seat"));
    var idx = el("div", { class: "pindex" });
    state.guests.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (g) {
        idx.appendChild(el("div", {}, g.name + " - " + (guestTableLabel(g.id) || "unseated")));
      });
    sheet.appendChild(idx);
    // floor plan
    if (state.tables.length) {
      var pf = el("div", { class: "pfloor" });
      pf.appendChild(el("h2", {}, "Floor plan"));
      pf.appendChild(exportSVG());
      sheet.appendChild(pf);
    }
    if (!isPro()) sheet.appendChild(el("p", { class: "pfoot" }, "Made with SeatSage · seatsage.whoffagents.com"));
  }

  var STYLE_MAP = {
    "tbl-shape": { fill: "#ffffff", stroke: "#9db8a5", "stroke-width": "2" },
    "seat": { fill: "#e6eee6", stroke: "#9db8a5", "stroke-width": "1" },
    "seat taken": { fill: "#3e6b50", stroke: "#335a42", "stroke-width": "1" },
    "seat-initials": { "font-size": "7.5px", "font-weight": "700", fill: "#ffffff", "text-anchor": "middle", "font-family": "Helvetica,Arial,sans-serif" },
    "tbl-label": { "font-size": "13px", "font-weight": "700", fill: "#212721", "text-anchor": "middle", "font-family": "Helvetica,Arial,sans-serif" },
    "tbl-cap": { "font-size": "10px", fill: "#5c665c", "text-anchor": "middle", "font-family": "Helvetica,Arial,sans-serif" },
    "tbl-cap full": { "font-size": "10px", fill: "#3e6b50", "text-anchor": "middle", "font-family": "Helvetica,Arial,sans-serif" }
  };
  function inlineStyles(node) {
    var nodes = node.querySelectorAll ? node.querySelectorAll("[class]") : [];
    Array.prototype.forEach.call(nodes, function (n) {
      var cls = n.getAttribute("class");
      var style = STYLE_MAP[cls];
      if (style) for (var k in style) n.setAttribute(k, style[k]);
      n.removeAttribute("class");
    });
  }
  function contentBounds() {
    var minX = FLOOR_W, minY = FLOOR_H, maxX = 0, maxY = 0;
    state.tables.forEach(function (t) {
      var h = tableGeom(t).half;
      minX = Math.min(minX, t.x - h); maxX = Math.max(maxX, t.x + h);
      minY = Math.min(minY, t.y - h); maxY = Math.max(maxY, t.y + h);
    });
    if (!state.tables.length) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
    var pad = 40;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }
  function exportSVG() {
    var b = contentBounds();
    var svg = svgEl("svg", { xmlns: SVGNS, viewBox: b.x + " " + b.y + " " + b.w + " " + b.h, width: b.w, height: b.h });
    svg.appendChild(svgEl("rect", { x: b.x, y: b.y, width: b.w, height: b.h, fill: "#ffffff" }));
    state.tables.forEach(function (t) { svg.appendChild(tableNode(t, true)); });
    return svg;
  }
  function downloadPNG() {
    if (!requirePro("PNG export")) return;
    var svg = exportSVG();
    var b = contentBounds();
    var xml = new XMLSerializer().serializeToString(svg);
    var img = new Image();
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    img.onload = function () {
      var scale = 2;
      var canvas = document.createElement("canvas");
      canvas.width = b.w * scale; canvas.height = b.h * scale;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var a = document.createElement("a");
      a.download = (state.eventName || "seating-chart").replace(/[^\w -]+/g, "") + "-floorplan.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast("Floor plan PNG downloaded");
    };
    img.onerror = function () { toast("PNG export failed in this browser. Try Print instead."); };
    img.src = url;
  }
  function downloadCSV() {
    if (!requirePro("CSV export")) return;
    var rows = [["Guest", "Table", "Seat"]];
    state.guests.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (g) {
        var a = state.assign[g.id];
        rows.push([g.name, a ? tableById(a.t).name : "", a ? String(a.s + 1) : ""]);
      });
    var csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    downloadBlob(csv, "text/csv", (state.eventName || "seating-chart").replace(/[^\w -]+/g, "") + ".csv");
    toast("CSV downloaded");
  }
  function downloadBackup() {
    downloadBlob(JSON.stringify(state, null, 1), "application/json",
      "seatsage-backup-" + new Date().toISOString().slice(0, 10) + ".json");
    toast("Backup saved. Keep it somewhere safe.");
  }
  function downloadBlob(text, type, filename) {
    var blob = new Blob([text], { type: type });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }
  function restoreFromFile(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var s = JSON.parse(r.result);
        if (!s || !Array.isArray(s.guests) || !Array.isArray(s.tables)) throw new Error("bad");
        s.assign = s.assign || {};
        s.nextId = s.nextId || 1000;
        state = s;
        mutate(function () {});
        toast("Backup restored");
      } catch (e) { toast("That doesn't look like a SeatSage backup file."); }
    };
    r.readAsText(file);
  }

  // ---------- wire up ----------
  function closeOverlays(ev) {
    document.querySelectorAll(".modal-overlay").forEach(function (m) {
      if (ev.target === m || ev.target.hasAttribute("data-close")) m.hidden = true;
    });
  }
  document.querySelectorAll(".modal-overlay").forEach(function (m) {
    m.addEventListener("click", closeOverlays);
  });

  $("eventName").addEventListener("input", function () {
    state.eventName = this.value; save();
  });
  $("addGuestForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var input = $("guestNameInput");
    if (!input.value.trim()) return;
    if (!canAddGuests(1)) { openUpgrade("Free plan is limited to " + CFG.FREE_MAX_GUESTS + " guests."); return; }
    mutate(function () { addGuest(input.value); });
    input.value = "";
    input.focus();
  });
  $("guestSearch").addEventListener("input", function () { ui.search = this.value; renderGuests(); });
  $("unseatedOnly").addEventListener("change", function () { ui.unseatedOnly = this.checked; renderGuests(); });
  $("cancelAssign").addEventListener("click", function () { ui.selectedGuest = null; render(); });

  $("bulkAddBtn").addEventListener("click", function () { $("bulkModal").hidden = false; $("bulkText").focus(); });
  $("bulkConfirm").addEventListener("click", function () {
    var names = $("bulkText").value.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!names.length) { $("bulkModal").hidden = true; return; }
    var allowed = isPro() ? names.length : Math.max(0, CFG.FREE_MAX_GUESTS - state.guests.length);
    var toAdd = names.slice(0, allowed);
    mutate(function () { toAdd.forEach(addGuest); });
    $("bulkText").value = "";
    $("bulkModal").hidden = true;
    if (toAdd.length < names.length) {
      openUpgrade("Added " + toAdd.length + " guests. Free plan caps at " + CFG.FREE_MAX_GUESTS + ". Upgrade for unlimited.");
    } else toast("Added " + toAdd.length + " guests");
  });

  $("addRound").addEventListener("click", function () { mutate(function () { addTable("round"); }); });
  $("addRect").addEventListener("click", function () { mutate(function () { addTable("rect"); }); });
  $("zoomIn").addEventListener("click", function () { ui.zoom = Math.min(2, ui.zoom + 0.15); renderFloor(); });
  $("zoomOut").addEventListener("click", function () { ui.zoom = Math.max(0.4, ui.zoom - 0.15); renderFloor(); });

  $("inspClose").addEventListener("click", function () { ui.selectedTable = null; render(); });
  $("inspName").addEventListener("input", function () {
    var t = tableById(ui.selectedTable);
    if (!t) return;
    t.name = this.value || "Table";
    save(); renderFloor(); renderGuests(); $("inspTitle").textContent = t.name;
  });
  $("seatMinus").addEventListener("click", function () {
    var t = tableById(ui.selectedTable);
    if (t) mutate(function () { setSeats(t, t.seats - 1); });
  });
  $("seatPlus").addEventListener("click", function () {
    var t = tableById(ui.selectedTable);
    if (t) mutate(function () { setSeats(t, t.seats + 1); });
  });
  $("rotBtn").addEventListener("click", function () {
    var t = tableById(ui.selectedTable);
    if (t) mutate(function () { t.rot = t.rot === 90 ? 0 : 90; });
  });
  $("deleteTable").addEventListener("click", function () {
    var t = tableById(ui.selectedTable);
    if (t && confirm("Delete “" + t.name + "”? Guests seated there will become unseated.")) {
      mutate(function () { deleteTable(t.id); });
    }
  });

  $("pickerSearch").addEventListener("input", renderPicker);

  var exportMenu = $("exportMenu");
  $("exportBtn").addEventListener("click", function (ev) {
    ev.stopPropagation();
    exportMenu.hidden = !exportMenu.hidden;
  });
  document.addEventListener("click", function () { exportMenu.hidden = true; });
  exportMenu.addEventListener("click", function (ev) { ev.stopPropagation(); });
  $("printBtn").addEventListener("click", function () {
    exportMenu.hidden = true;
    buildPrintSheet();
    window.print();
  });
  $("pngBtn").addEventListener("click", function () { exportMenu.hidden = true; downloadPNG(); });
  $("csvBtn").addEventListener("click", function () { exportMenu.hidden = true; downloadCSV(); });
  $("backupBtn").addEventListener("click", function () { exportMenu.hidden = true; downloadBackup(); });
  $("restoreBtn").addEventListener("click", function () { exportMenu.hidden = true; $("restoreFile").click(); });
  $("restoreFile").addEventListener("change", function () {
    if (this.files[0]) restoreFromFile(this.files[0]);
    this.value = "";
  });

  $("upgradeBtn").addEventListener("click", function () { openUpgrade(); });
  $("unlockForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var msg = $("unlockMsg");
    tryUnlock($("unlockInput").value).then(function (ok) {
      if (ok) {
        msg.textContent = "Pro unlocked. Enjoy!";
        msg.className = "tiny ok";
        setTimeout(function () { $("upgradeModal").hidden = true; render(); }, 900);
      } else {
        msg.textContent = "That code doesn't look right. Check for typos (0 vs O).";
        msg.className = "tiny err";
      }
    });
  });

  // demo seed for first-time users
  if (!state.tables.length && !state.guests.length && !localStorage.getItem("seatsage:seen")) {
    localStorage.setItem("seatsage:seen", "1");
    addTable("round");
    tableById(ui.selectedTable).name = "Table 1";
    ui.selectedTable = null;
    ["Alex Rivera", "Sam Chen", "Jordan Lee"].forEach(addGuest);
    save();
  }
  if (location.hash === "#upgrade") openUpgrade();
  render();
  // center the view on the tables (matters on phones)
  (function () {
    if (!state.tables.length) return;
    var b = contentBounds();
    var sc = $("floorScroll");
    sc.scrollLeft = Math.max(0, (b.x + b.w / 2) * ui.zoom - sc.clientWidth / 2);
    sc.scrollTop = Math.max(0, (b.y + b.h / 2) * ui.zoom - sc.clientHeight / 2);
  })();
})();
