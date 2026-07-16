(function () {
  'use strict';

  /* ---------------- data ---------------- */

  var FORMS = [
    { id: 'zeile', label: 'Küchenzeile', desc: 'Alles an einer Wand', base: 2500, img: 'assets/images/form-zeile.jpg' },
    { id: 'lform', label: 'L-Form', desc: 'Über Eck, viel Stauraum', base: 3500, img: 'assets/images/form-lform.jpg' },
    { id: 'uform', label: 'U-Form', desc: 'Drei Seiten, max. Fläche', base: 4500, img: 'assets/images/form-uform.jpg' },
    { id: 'insel', label: 'Kücheninsel', desc: 'Freistehend, offener Raum', base: 6000, img: 'assets/images/form-insel.jpg' }
  ];
  var FRONTS = [
    { id: 'klassik', label: 'Klassik mit Griff', desc: 'Zeitlos, mit sichtbarem Griff', perSqm: 380, color: '#F1ECE0', img: 'assets/images/front-klassik.jpg' },
    { id: 'grifflos', label: 'Grifflos mit Griffmulden', desc: 'Modern, Griff per Fräsung integriert', perSqm: 440, color: '#EDEAE1', img: 'assets/images/front-grifflos.jpg' },
    { id: 'landhaus', label: 'Landhaus', desc: 'Rahmenfront im Landhausstil', perSqm: 420, color: '#F3EEE1', img: 'assets/images/front-landhaus.jpg' },
    { id: 'gola', label: 'Gola', desc: 'Grifflos mit Alu-Profilsystem', perSqm: 520, color: '#E4E1DA', img: 'assets/images/front-gola.jpg' }
  ];
  var WORKTOPS = [
    { id: 'holzdekor', label: 'Holzdekorarbeitsplatte', desc: 'Warm & robust', perSqm: 120, color: '#B07A4E', img: 'assets/images/worktop-holzdekor.jpg' },
    { id: 'beton', label: 'Beton-Optik', desc: 'Industrial, matt', perSqm: 180, color: '#8C8B86', img: 'assets/images/worktop-beton.jpg' },
    { id: 'keramik', label: 'Keramik', desc: 'Kratzfest, premium', perSqm: 400, color: '#E4DFD4', img: 'assets/images/worktop-keramik.jpg' }
  ];
  var APPLIANCES = [
    { id: 'basis', label: 'Basis', desc: 'Kochfeld · Ofen · Kühlschrank · Spüle', add: 1800, tier: 1 },
    { id: 'komfort', label: 'Komfort', desc: '+ Geschirrspüler · Dunstabzug · Induktion', add: 3200, tier: 2 },
    { id: 'premium', label: 'Premium', desc: '+ Dampfgarer · XXL-Kühl · Marken', add: 5400, tier: 3 }
  ];
  var STEPS = [
    { key: 'form', kicker: 'Schritt 1 von 5', title: 'Welche Küchenform?', sub: 'Der Grundriss bestimmt Stauraum und Preisrahmen.', type: 'choice' },
    { key: 'size', kicker: 'Schritt 2 von 5', title: 'Länge & Breite der Küche', sub: 'Beide Maße zusammen ergeben die Fläche für Fronten und Arbeitsplatte.', type: 'dims' },
    { key: 'front', kicker: 'Schritt 3 von 5', title: 'Fronten & Farbe', sub: 'Der sichtbare Charakter deiner Küche.', type: 'choice' },
    { key: 'worktop', kicker: 'Schritt 4 von 5', title: 'Arbeitsplatte', sub: 'Material für Optik und Haltbarkeit.', type: 'choice' },
    { key: 'appliances', kicker: 'Schritt 5 von 5', title: 'Geräte-Paket', sub: 'Von solide bis vollausgestattet.', type: 'choice' },
    { key: 'result', kicker: 'Geschafft', title: 'Dein unverbindlicher Richtpreis', sub: 'Basierend auf deiner Auswahl.', type: 'result' }
  ];
  var NAV_LABELS = ['Form', 'Größe', 'Fronten', 'Platte', 'Geräte', 'Preis'];

  /* ---------------- state ---------------- */

  function blankState() {
    return { step: 0, form: null, length: 400, width: 300, front: null, worktop: null, appliances: null, name: '', email: '', phone: '', submitted: false };
  }
  var state = blankState();

  function euro(n) { return Math.round(n).toLocaleString('de-DE') + ' €'; }
  function meters(cm) { return (cm / 100).toFixed(1).replace('.', ','); }
  function area(st) { return Math.round((st.length / 100) * (st.width / 100) * 10) / 10; }

  function optionsFor(step) {
    if (step.key === 'form') return FORMS;
    if (step.key === 'front') return FRONTS;
    if (step.key === 'worktop') return WORKTOPS;
    if (step.key === 'appliances') return APPLIANCES;
    return [];
  }

  function priceLabel(step, o) {
    if (step.key === 'form') return 'ab ' + euro(o.base);
    if (step.key === 'front' || step.key === 'worktop') return euro(o.perSqm) + ' /m²';
    if (step.key === 'appliances') return '+ ' + euro(o.add);
    return '';
  }

  function computePrice(st) {
    var f = FORMS.filter(function (x) { return x.id === st.form; })[0];
    var fr = FRONTS.filter(function (x) { return x.id === st.front; })[0];
    var w = WORKTOPS.filter(function (x) { return x.id === st.worktop; })[0];
    var a = APPLIANCES.filter(function (x) { return x.id === st.appliances; })[0];
    var p = 0;
    if (f) p += f.base;
    if (fr) p += area(st) * fr.perSqm;
    if (w) p += area(st) * w.perSqm;
    if (a) p += a.add;
    return p;
  }

  /* ---------------- svg icons ---------------- */

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function formIconSvg(id) {
    var map = {
      zeile: [[6, 8, 68, 12]],
      lform: [[6, 8, 68, 12], [6, 8, 12, 48]],
      uform: [[6, 8, 68, 12], [6, 8, 12, 48], [62, 8, 12, 48]],
      insel: [[6, 8, 68, 12], [28, 36, 24, 16]]
    };
    var rects = map[id] || [];
    var body = '<rect x="2" y="2" width="76" height="60" rx="6" fill="none" stroke="rgba(197,143,82,0.35)" stroke-width="2"></rect>';
    rects.forEach(function (r) {
      body += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="3" fill="#C58F52"></rect>';
    });
    return '<svg viewBox="0 0 80 64" width="64" height="52" style="display:block">' + body + '</svg>';
  }

  function tierBarsSvg(level, dark) {
    var hs = [20, 30, 42];
    var off = dark ? 'rgba(234,227,215,0.16)' : 'rgba(20,58,61,0.14)';
    var bars = hs.map(function (h, i) {
      var fill = (i + 1) <= level ? '#C58F52' : off;
      var y = 42 - h;
      return '<rect x="' + (i * 30) + '" y="' + y + '" width="22" height="' + h + '" rx="5" fill="' + fill + '"></rect>';
    }).join('');
    return '<svg viewBox="0 0 82 42" width="72" height="38" style="display:block">' + bars + '</svg>';
  }

  function swatchDiv(color, glossy) {
    var glossLayer = glossy ? ';background-image:linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%)' : '';
    return '<div style="width:100%;height:100%;background:' + color + glossLayer + ';border-bottom:1px solid rgba(0,0,0,0.06)"></div>';
  }

  function frontMedia(o) {
    var accent = '';
    if (o.id === 'klassik') {
      accent = '<div style="position:absolute;top:20%;bottom:20%;right:16%;width:6px;border-radius:3px;background:#C58F52"></div>';
    } else if (o.id === 'grifflos') {
      accent = '<div style="position:absolute;left:12%;right:12%;top:18%;height:5px;border-radius:3px;background:rgba(0,0,0,0.2)"></div>';
    } else if (o.id === 'landhaus') {
      accent = '<div style="position:absolute;inset:16%;border:3px solid rgba(0,0,0,0.16);border-radius:2px"></div>';
    } else if (o.id === 'gola') {
      accent = '<div style="position:absolute;top:0;left:0;right:0;height:8px;background:#2B2B2B"></div>';
    }
    return '<div style="position:relative;width:100%;height:100%;background:' + o.color + ';border-bottom:1px solid rgba(0,0,0,0.06)">' + accent + '</div>';
  }

  function photoMedia(src) {
    return '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">';
  }

  function mediaFor(step, o, dark) {
    if (step.key === 'front') return o.img ? photoMedia(o.img) : frontMedia(o);
    if (step.key === 'worktop') return o.img ? photoMedia(o.img) : swatchDiv(o.color, false);
    if (step.key === 'appliances') return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">' + tierBarsSvg(o.tier, dark) + '</div>';
    return o.img ? photoMedia(o.img) : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">' + formIconSvg(o.id) + '</div>';
  }

  /* ---------------- view model ---------------- */

  function buildVM() {
    var idx = state.step;
    var step = STEPS[idx];
    var raw = step.type === 'choice' ? optionsFor(step) : [];

    var options = raw.map(function (o) {
      return {
        id: o.id, label: o.label, desc: o.desc,
        priceLabel: priceLabel(step, o),
        selected: state[step.key] === o.id
      };
    });

    var p = computePrice(state);
    var mid = Math.round(p / 100) * 100;
    var min = Math.round(mid * 0.92 / 100) * 100;
    var max = Math.round(mid * 1.08 / 100) * 100;

    var f = FORMS.filter(function (x) { return x.id === state.form; })[0];
    var fr = FRONTS.filter(function (x) { return x.id === state.front; })[0];
    var w = WORKTOPS.filter(function (x) { return x.id === state.worktop; })[0];
    var a = APPLIANCES.filter(function (x) { return x.id === state.appliances; })[0];

    var areaVal = area(state);
    var summary = [
      { label: 'Küchenform', value: f ? f.label : '—' },
      { label: 'Größe', value: meters(state.length) + ' × ' + meters(state.width) + ' m (' + String(areaVal).replace('.', ',') + ' m²)' },
      { label: 'Fronten', value: fr ? fr.label : '—' },
      { label: 'Arbeitsplatte', value: w ? w.label : '—' },
      { label: 'Geräte', value: a ? a.label : '—' }
    ];

    var canNext = step.type === 'choice' ? !!state[step.key] : step.type === 'dims';
    var canSubmit = !!(state.name.trim() && state.email.trim() && state.phone.trim());

    return {
      idx: idx, step: step,
      stepNum: idx + 1,
      barPct: Math.round(idx / (STEPS.length - 1) * 100),
      options: options,
      length: state.length, width: state.width, area: areaVal,
      sizeTag: areaVal < 9 ? 'Kompakt' : areaVal < 15 ? 'Mittel' : 'Großzügig',
      showBack: idx > 0,
      showNext: step.type !== 'result',
      canNext: canNext,
      priceMin: euro(min), priceMax: euro(max), priceMid: euro(mid),
      hasPrice: p > 0,
      summary: summary,
      canSubmit: canSubmit,
      navSteps: STEPS.map(function (s, i) {
        return { num: i + 1, label: NAV_LABELS[i], active: i === idx, done: i < idx, upcoming: i > idx, filled: i <= idx };
      })
    };
  }

  /* ---------------- actions ---------------- */

  function setState(patch) {
    for (var k in patch) state[k] = patch[k];
    render();
  }
  function goStep(i) { setState({ step: Math.max(0, Math.min(STEPS.length - 1, i)) }); }
  function selectOption(key, id) { var p = {}; p[key] = id; setState(p); }
  function next() { var vm = buildVM(); if (vm.canNext) goStep(vm.idx + 1); }
  function back() { goStep(buildVM().idx - 1); }
  function submit() { var vm = buildVM(); if (vm.canSubmit) setState({ submitted: true }); }
  function reset() { state = blankState(); render(); }

  /* ---------------- desktop render ---------------- */

  function renderStepBody(vm, dark, prefix) {
    var step = vm.step;
    if (step.type === 'choice') {
      var cls = dark ? 'm-options' : 'd-options';
      var optCls = dark ? 'm-opt' : 'd-opt';
      var html = '<div class="' + cls + '">';
      vm.options.forEach(function (opt) {
        html += '<button type="button" class="' + optCls + (opt.selected ? ' selected' : '') + '" data-action="select" data-key="' + step.key + '" data-id="' + opt.id + '">'
          + '<div class="' + (dark ? 'm-opt-media' : 'd-opt-media') + '">' + mediaFor(step, rawOptionById(step, opt.id), dark) + '</div>'
          + '<div class="' + (dark ? 'm-opt-body' : 'd-opt-body') + '">';
        if (dark) {
          html += '<div class="m-opt-label">' + esc(opt.label) + '</div>'
            + '<div class="m-opt-price">' + esc(opt.priceLabel) + '</div>'
            + '<p class="m-opt-desc">' + esc(opt.desc) + '</p>';
        } else {
          html += '<div class="d-opt-row"><span class="d-opt-label">' + esc(opt.label) + '</span><span class="d-opt-price">' + esc(opt.priceLabel) + '</span></div>'
            + '<p class="d-opt-desc">' + esc(opt.desc) + '</p>';
        }
        html += '</div>';
        if (opt.selected) {
          html += '<div class="' + (dark ? 'm-opt-check' : 'd-opt-check') + '">✓</div>';
        }
        html += '</button>';
      });
      html += '</div>';
      return html;
    }
    if (step.type === 'dims') {
      var dims = [
        { key: 'length', label: 'Länge', val: vm.length, min: 200, max: 600, minLabel: '2,0 m', maxLabel: '6,0 m' },
        { key: 'width', label: 'Breite', val: vm.width, min: 150, max: 400, minLabel: '1,5 m', maxLabel: '4,0 m' }
      ];
      if (dark) {
        var mBlocks = dims.map(function (d) {
          return '<div class="m-dim-block">'
            + '<div class="m-dim-head"><span class="m-dim-label">' + d.label + '</span><span class="m-dim-val">' + d.val + ' cm</span></div>'
            + '<input type="range" min="' + d.min + '" max="' + d.max + '" step="10" value="' + d.val + '" class="m-slider" data-action="dim" data-dim="' + d.key + '">'
            + '<div class="m-size-minmax"><span>' + d.minLabel + '</span><span>' + d.maxLabel + '</span></div>'
            + '</div>';
        }).join('');
        return '<div class="m-size-card">' + mBlocks
          + '<div class="m-area-result"><span class="m-area-num">' + String(vm.area).replace('.', ',') + ' m²</span><span class="m-area-tag">' + vm.sizeTag + '</span></div>'
          + '</div>';
      }
      var dBlocks = dims.map(function (d) {
        return '<div class="d-dim-block">'
          + '<div class="d-dim-head"><span class="d-dim-label">' + d.label + '</span><span class="d-dim-val">' + d.val + ' cm</span></div>'
          + '<input type="range" min="' + d.min + '" max="' + d.max + '" step="10" value="' + d.val + '" class="d-slider" data-action="dim" data-dim="' + d.key + '">'
          + '<div class="d-size-minmax"><span>' + d.minLabel + '</span><span>' + d.maxLabel + '</span></div>'
          + '</div>';
      }).join('');
      return '<div class="d-size-card">' + dBlocks
        + '<div class="d-area-result"><span class="d-area-num">' + String(vm.area).replace('.', ',') + ' m²</span><span class="d-area-tag">' + vm.sizeTag + '</span></div>'
        + '</div>';
    }
    if (step.type === 'result') {
      return renderResult(vm, dark);
    }
    return '';
  }

  function rawOptionById(step, id) {
    var list = optionsFor(step);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return {};
  }

  function renderResult(vm, dark) {
    var summaryCls = dark ? 'm-summary-row' : 'd-summary-row';
    var summaryHtml = vm.summary.map(function (row) {
      return '<div class="' + summaryCls + '"><span>' + esc(row.label) + '</span><span>' + esc(row.value) + '</span></div>';
    }).join('');

    var fieldsHtml, formTop, formBottom;
    if (dark) {
      fieldsHtml = '<div class="m-fields">'
        + '<input type="text" value="' + esc(state.name) + '" placeholder="Name" data-action="field" data-field="name">'
        + '<input type="email" value="' + esc(state.email) + '" placeholder="E-Mail" data-action="field" data-field="email">'
        + '<input type="tel" value="' + esc(state.phone) + '" placeholder="Telefon" data-action="field" data-field="phone">'
        + '</div>';
    } else {
      fieldsHtml = '<div class="d-fields">'
        + '<label class="d-field">Name<input type="text" value="' + esc(state.name) + '" placeholder="Vor- und Nachname" data-action="field" data-field="name"></label>'
        + '<label class="d-field">E-Mail<input type="email" value="' + esc(state.email) + '" placeholder="name@beispiel.de" data-action="field" data-field="email"></label>'
        + '<label class="d-field">Telefon<input type="tel" value="' + esc(state.phone) + '" placeholder="+49 …" data-action="field" data-field="phone"></label>'
        + '</div>';
    }

    if (!state.submitted) {
      if (dark) {
        return '<div class="m-price-card">'
          + '<div class="m-price-kicker">Dein Richtpreis</div>'
          + '<div class="m-price-num">' + vm.priceMin + ' – ' + vm.priceMax + '</div>'
          + '<div class="m-price-note">inkl. Lieferung &amp; Montage · unverbindlich</div>'
          + '</div>'
          + '<div class="m-summary">' + summaryHtml + '</div>'
          + '<h3 class="m-form-title">Angebot sichern</h3>'
          + fieldsHtml
          + '<button type="button" class="m-submit" data-action="submit">Angebot anfordern</button>'
          + (vm.canSubmit ? '' : '<p class="m-warn">Bitte alle Felder ausfüllen.</p>')
          + '<p class="m-legal">Mit dem Absenden stimmst du der Kontaktaufnahme durch Kim Küchen zu.</p>';
      }
      return '<div class="d-result">'
        + '<div class="d-price-card">'
        + '<div class="d-price-kicker">Geschätzter Preis</div>'
        + '<div class="d-price-num">' + vm.priceMin + ' – ' + vm.priceMax + '</div>'
        + '<p class="d-price-note">inkl. Lieferung &amp; Montage · unverbindlicher Richtwert.</p>'
        + '<div class="d-summary">' + summaryHtml + '</div>'
        + '</div>'
        + '<div>'
        + '<h3 class="d-form-title">Preis per E-Mail sichern</h3>'
        + '<p class="d-form-sub">Wir senden dir die Zusammenfassung und ein persönliches Angebot.</p>'
        + fieldsHtml
        + '<button type="button" class="d-submit" data-action="submit">Persönliches Angebot anfordern</button>'
        + (vm.canSubmit ? '' : '<p class="d-warn">Bitte Name, E-Mail und Telefon ausfüllen.</p>')
        + '<p class="d-legal">Mit dem Absenden stimmst du der Kontaktaufnahme durch Kim Küchen zu. Deine Daten werden nicht weitergegeben.</p>'
        + '</div>'
        + '</div>';
    }

    if (dark) {
      return '<div class="m-thanks">'
        + '<div class="m-thanks-check">✓</div>'
        + '<h3>Danke, ' + esc(state.name) + '!</h3>'
        + '<p>Elena Kim meldet sich in Kürze mit deinem persönlichen Angebot.</p>'
        + '<button type="button" class="m-reset" data-action="reset">Neue Küche konfigurieren</button>'
        + '</div>';
    }
    return '<div class="d-result">'
      + '<div class="d-price-card">'
      + '<div class="d-price-kicker">Geschätzter Preis</div>'
      + '<div class="d-price-num">' + vm.priceMin + ' – ' + vm.priceMax + '</div>'
      + '<p class="d-price-note">inkl. Lieferung &amp; Montage · unverbindlicher Richtwert.</p>'
      + '<div class="d-summary">' + summaryHtml + '</div>'
      + '</div>'
      + '<div class="d-thanks">'
      + '<div class="d-thanks-check">✓</div>'
      + '<h3>Danke, ' + esc(state.name) + '!</h3>'
      + '<p>Elena Kim meldet sich in Kürze mit deinem persönlichen Angebot.</p>'
      + '<button type="button" class="d-reset" data-action="reset">Neue Küche konfigurieren</button>'
      + '</div>'
      + '</div>';
  }

  function renderDesktop(vm) {
    var nav = vm.navSteps.map(function (n) {
      var badgeCls = n.active ? 'active' : n.done ? 'done' : 'upcoming';
      var badgeContent = n.done ? '✓' : n.num;
      return '<button type="button" class="d-nav-item" data-action="goto" data-step="' + (n.num - 1) + '">'
        + '<span class="d-nav-badge ' + badgeCls + '">' + badgeContent + '</span>'
        + '<span class="d-nav-label">' + esc(n.label) + '</span>'
        + '</button>';
    }).join('');

    var footer = '<div class="d-footer"><div>'
      + (vm.showBack ? '<button type="button" class="d-back" data-action="back">← Zurück</button>' : '')
      + '</div><div>'
      + (vm.showNext ? '<button type="button" class="d-next" data-action="next"' + (vm.canNext ? '' : ' disabled') + '>' + (vm.canNext ? 'Weiter →' : 'Bitte wählen') + '</button>' : '')
      + '</div></div>';

    return '<div class="d-page"><div class="d-shell">'
      + '<div class="d-header"><img src="assets/logo.png" alt="Kim Küchen"><div class="tag">Küchen-Konfigurator</div></div>'
      + '<div class="d-progress"><div style="width:' + vm.barPct + '%"></div></div>'
      + '<div class="d-body">'
      + '<div class="d-nav">' + nav + '<div class="d-nav-foot">Unverbindlich &amp; kostenlos. In unter 2 Minuten zum Richtpreis.</div></div>'
      + '<div class="d-content">'
      + '<div class="d-kicker">' + esc(vm.step.kicker) + '</div>'
      + '<h2 class="d-title heading">' + esc(vm.step.title) + '</h2>'
      + '<p class="d-sub">' + esc(vm.step.sub) + '</p>'
      + renderStepBody(vm, false)
      + (vm.step.type === 'result' ? '' : footer)
      + '</div></div></div></div>';
  }

  function renderMobile(vm) {
    var progress = vm.navSteps.map(function (n) {
      return '<div class="' + (n.filled ? 'filled' : '') + '"></div>';
    }).join('');

    var priceMid = vm.hasPrice ? '<div class="label">Zwischenstand</div><div class="val">ca. ' + vm.priceMid + '</div>' : '<div class="pending">Preis berechnet sich live …</div>';

    var footer = '<div class="m-footer">'
      + (vm.showBack ? '<button type="button" class="m-footer-back" data-action="back">←</button>' : '')
      + '<div class="m-footer-mid">' + priceMid + '</div>'
      + (vm.showNext ? '<button type="button" class="m-footer-next" data-action="next"' + (vm.canNext ? '' : ' disabled') + '>Weiter</button>' : '')
      + '</div>';

    return '<div class="m-page">'
      + '<div class="m-head"><img src="assets/logo.png" alt="Kim Küchen"><span class="step">Schritt ' + vm.stepNum + '/6</span></div>'
      + '<div class="m-progress">' + progress + '</div>'
      + '<div class="m-content">'
      + '<div class="m-kicker">' + esc(vm.step.kicker) + '</div>'
      + '<h2 class="m-title heading">' + esc(vm.step.title) + '</h2>'
      + '<p class="m-sub">' + esc(vm.step.sub) + '</p>'
      + renderStepBody(vm, true)
      + '</div>'
      + (vm.step.type === 'result' ? '' : footer)
      + '</div>';
  }

  /* ---------------- render + events ---------------- */

  var desktopRoot = document.getElementById('desktop-root');
  var mobileRoot = document.getElementById('mobile-root');

  function render() {
    var vm = buildVM();
    desktopRoot.innerHTML = renderDesktop(vm);
    mobileRoot.innerHTML = renderMobile(vm);
  }

  function handleClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    if (action === 'select') selectOption(el.getAttribute('data-key'), el.getAttribute('data-id'));
    else if (action === 'goto') goStep(parseInt(el.getAttribute('data-step'), 10));
    else if (action === 'next') next();
    else if (action === 'back') back();
    else if (action === 'submit') submit();
    else if (action === 'reset') reset();
  }

  function handleInput(e) {
    var el = e.target;
    var action = el.getAttribute('data-action');
    if (action === 'dim') { state[el.getAttribute('data-dim')] = Number(el.value); render(); focusAfterRender(el); }
    else if (action === 'field') { state[el.getAttribute('data-field')] = el.value; render(); focusAfterRender(el); }
  }

  var pendingFocus = null;
  function focusAfterRender(el) {
    var discriminator = el.getAttribute('data-field') || el.getAttribute('data-dim');
    var attr = el.getAttribute('data-field') ? 'data-field' : 'data-dim';
    pendingFocus = { selector: '[data-action="' + el.getAttribute('data-action') + '"]' + (discriminator ? '[' + attr + '="' + discriminator + '"]' : ''), root: el.closest('.view') };
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);

  var origRender = render;
  render = function () {
    origRender();
    if (pendingFocus) {
      var root = pendingFocus.root && pendingFocus.root.id === 'desktop-root' ? desktopRoot : mobileRoot;
      var target = root.querySelector(pendingFocus.selector);
      if (target) {
        target.focus();
        var selectableTypes = ['text', 'search', 'url', 'tel', 'password'];
        if (selectableTypes.indexOf(target.type) !== -1) {
          var v = target.value;
          target.setSelectionRange(v.length, v.length);
        }
      }
      pendingFocus = null;
    }
  };

  render();
})();
