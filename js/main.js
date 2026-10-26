// G·SOL: menú, horario en vivo, formulario a WhatsApp, comparadores, carrusel y efectos (hero con profundidad,
// paneles que se acercan al bajar, titulares por líneas, contadores, lema gigante, parallax y scroll suave)
(function () {
  var reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tactil = matchMedia('(hover: none), (pointer: coarse)').matches;
  var g = window.gsap, ST = window.ScrollTrigger;

  // ---------- menú ----------
  var bm = document.querySelector('[data-menu]'), pm = document.querySelector('[data-menu-panel]');
  function menu(abrir) { if (!bm) return; bm.setAttribute('aria-expanded', abrir ? 'true' : 'false'); bm.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú'); pm.hidden = !abrir; document.body.style.overflow = abrir ? 'hidden' : ''; }
  if (bm) { bm.addEventListener('click', function () { menu(bm.getAttribute('aria-expanded') !== 'true'); }); pm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); }); }
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && pm && !pm.hidden) menu(false); });

  // ---------- abierto ahora (hora de Madrid) ----------
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function ahora() {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
  }
  var min = function (t) { var a = t.split(':'); return +a[0] * 60 + (+a[1]); };
  var hora = function (t) { return t.replace(/^0/, ''); };
  function estado(el) {
    var H = JSON.parse(el.dataset.horario), n = ahora(), hoy = H[n.d] || [], txt, abierto = false;
    for (var i = 0; i < hoy.length; i++) if (n.m >= min(hoy[i][0]) && n.m < min(hoy[i][1])) { abierto = true; txt = 'Abierto ahora · hasta las ' + hora(hoy[i][1]); }
    if (!abierto) {
      var luego = hoy.filter(function (t) { return min(t[0]) > n.m; })[0];
      if (luego) txt = 'Cerrado · abre hoy a las ' + hora(luego[0]);
      else for (var k = 1; k <= 7; k++) { var d = (n.d + k) % 7; if ((H[d] || []).length) { txt = 'Cerrado · abre ' + (k === 1 ? 'mañana' : 'el ' + DIAS[d]) + ' a las ' + hora(H[d][0][0]); break; } }
    }
    el.classList.toggle('es-abierto', abierto); el.querySelector('[data-estado-txt]').textContent = txt;
  }
  var estados = document.querySelectorAll('[data-estado]'), pinta = function () { estados.forEach(estado); };
  pinta(); setInterval(pinta, 60000);

  // ---------- formulario → WhatsApp ----------
  document.querySelectorAll('form[data-whatsapp]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); var d = new FormData(f), l = ['Hola, quiero pedir presupuesto para una reforma.'];
      if (d.get('nombre')) l.push('Nombre: ' + d.get('nombre')); if (d.get('telefono')) l.push('Teléfono: ' + d.get('telefono'));
      l.push('Tipo: ' + d.get('tipo')); if (d.get('mensaje')) l.push(d.get('mensaje'));
      open('https://wa.me/' + f.dataset.whatsapp + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
    });
  });

  // ---------- comparadores (arrastrar en cualquier punto; teclado con el rango oculto) ----------
  document.querySelectorAll('[data-comp]').forEach(function (c) {
    var marco = c.querySelector('.comp__marco'), rango = c.querySelector('.comp__rango');
    var pon = function (v) { v = Math.max(0, Math.min(100, v)); marco.style.setProperty('--pos', v + '%'); rango.value = v; };
    rango.addEventListener('input', function () { pon(+rango.value); });
    var activo = false, mueve = function (e) { var r = marco.getBoundingClientRect(); pon((e.clientX - r.left) / r.width * 100); };
    marco.addEventListener('pointerdown', function (e) { activo = true; mueve(e); });
    addEventListener('pointermove', function (e) { if (activo) mueve(e); }, { passive: true });
    addEventListener('pointerup', function () { activo = false; });
    addEventListener('pointercancel', function () { activo = false; });
    // barrido de muestra: la línea va a un lado y vuelve al centro
    c._barre = function () {
      if (reducido) return; var t0 = null;
      var io = function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
      var paso = function (t) { if (!t0) t0 = t; var s = (t - t0) / 1000; pon(s < .9 ? 50 - 30 * io(s / .9) : s < 2 ? 20 + 30 * io((s - .9) / 1.1) : 50); if (s < 2) requestAnimationFrame(paso); };
      requestAnimationFrame(paso);
    };
  });

  // ---------- carrusel de servicios en móvil ----------
  document.querySelectorAll('[data-carrusel]').forEach(function (c) {
    var p = c.querySelector('[data-carrusel-pista]'), ant = c.querySelector('[data-prev]'), sig = c.querySelector('[data-next]');
    var paso = function (d) { var t = p.firstElementChild; p.scrollBy({ left: d * (t ? t.getBoundingClientRect().width + 14 : p.clientWidth * .8), behavior: reducido ? 'auto' : 'smooth' }); };
    var est = function () { var max = p.scrollWidth - p.clientWidth; c.classList.toggle('sin-desborde', max <= 2); ant.disabled = p.scrollLeft <= 4; sig.disabled = p.scrollLeft >= max - 4; };
    ant.addEventListener('click', function () { paso(-1); }); sig.addEventListener('click', function () { paso(1); });
    p.addEventListener('scroll', est, { passive: true }); addEventListener('resize', est); est();
  });

  // ---------- plano de la reforma: cada estancia se ilumina con su fila de la tabla (ratón, teclado, toque o recorrido automático) ----------
  var plano = document.querySelector('[data-plano]'), zonas = [], recorrido = null;
  if (plano) {
    zonas = plano.querySelectorAll('[data-zona]');
    var filas = plano.querySelectorAll('[data-fila]'), etq = plano.querySelector('[data-plano-etq]'), svgZ = plano.querySelector('.plano__zonas');
    var actual = -1, pausa = false;
    plano._activa = function (i) {
      actual = i;
      zonas.forEach(function (z, j) { z.classList.toggle('es-activa', j === i); });
      filas.forEach(function (f, j) { f.classList.toggle('es-activa', j === i); });
      svgZ.classList.toggle('hay-activa', i >= 0);
      if (i < 0) { etq.classList.remove('es-visible'); return; }
      etq.style.left = zonas[i].dataset.cx + '%'; etq.style.top = zonas[i].dataset.cy + '%';
      etq.querySelector('b').textContent = filas[i].querySelector('th').textContent;
      etq.querySelector('span').textContent = filas[i].querySelector('td').textContent;
      etq.classList.add('es-visible');
    };
    var aMano = function (i) { pausa = true; plano._activa(i); };
    filas.forEach(function (f, i) { ['mouseenter', 'focus', 'click'].forEach(function (ev) { f.addEventListener(ev, function () { aMano(i); }); }); });
    zonas.forEach(function (z, i) { ['mouseenter', 'click'].forEach(function (ev) { z.addEventListener(ev, function () { aMano(i); }); }); });
    plano.addEventListener('mouseleave', function () { pausa = false; });
    // recorrido automático por las estancias mientras el plano se ve (se para si el usuario señala una)
    plano._recorrido = function (on) {
      clearInterval(recorrido); if (!on || reducido) return;
      recorrido = setInterval(function () { if (!pausa) plano._activa((actual + 1) % zonas.length); }, 2100);
    };
  }

  // ---------- cabecera: de cal esmerilada al bajar; se oculta al bajar y vuelve al subir ----------
  var cab = document.querySelector('[data-cab]'), hero = document.querySelector('[data-hero]'), ultimo = 0;
  function cabecera(y) {
    if (!cab) return;
    cab.classList.toggle('es-solida', y > 40 || !hero);
    cab.classList.toggle('se-oculta', y > ultimo + 2 && y > innerHeight && !(pm && !pm.hidden));
    if (Math.abs(y - ultimo) > 2) ultimo = y;
  }
  cabecera(scrollY);

  if (reducido || !g || !ST) {
    addEventListener('scroll', function () { cabecera(scrollY); }, { passive: true });
    document.querySelectorAll('[data-revela]').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    zonas.forEach(function (z) { z.style.strokeDashoffset = 0; });
    return;
  }
  g.registerPlugin(ST); if (window.SplitText) g.registerPlugin(window.SplitText);

  // ---------- scroll suave (solo con ratón o trackpad) ----------
  if (window.Lenis && !tactil) {
    var lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
    lenis.on('scroll', function (e) { ST.update(); cabecera(e.scroll); });
    g.ticker.add(function (t) { lenis.raf(t * 1000); }); g.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href*="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var u = new URL(a.href, location.href); if (u.pathname !== location.pathname || !u.hash || u.hash.length < 2) return;
        var t = document.querySelector(u.hash); if (!t) return; ev.preventDefault(); lenis.scrollTo(t, { offset: -10, duration: 1.4 });
      });
    });
  } else addEventListener('scroll', function () { cabecera(scrollY); }, { passive: true });

  // ---------- hero: al bajar, el nombre se hunde más despacio que la casa (profundidad). La entrada la hace el CSS ----------
  if (hero) {
    var casaImg = hero.querySelector('[data-casa] img'), gig = hero.querySelector('[data-gigante]');
    var tl = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    g.to(gig, { yPercent: 70, ease: 'none', scrollTrigger: tl });
    if (casaImg) g.to(casaImg, { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: tl });
    var cieloImg = hero.querySelector('.hero__cielo img');
    if (cieloImg) g.to(cieloImg, { yPercent: 18, ease: 'none', scrollTrigger: tl });
  }

  // ---------- titulares por líneas ----------
  var splits = function () {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (!window.SplitText) return;
      var s = new SplitText(el, { type: 'lines', linesClass: 'ln' });
      s.lines.forEach(function (l) { l.innerHTML = '<span class="ln__in">' + l.innerHTML + '</span>'; });
      g.from(el.querySelectorAll('.ln__in'), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    ST.refresh();
  };
  if (document.fonts) document.fonts.ready.then(splits); else splits();

  // ---------- paneles de pizarra: se acercan (escala y redondeo) al entrar en pantalla ----------
  g.utils.toArray('[data-panel]').forEach(function (p) {
    g.fromTo(p, { scale: .94, borderRadius: 48 }, { scale: 1, borderRadius: 26, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'top 55%', scrub: true } });
  });

  // ---------- casco: entra girando un poco ----------
  var casco = document.querySelector('[data-casco]');
  if (casco) g.fromTo(casco, { xPercent: 12, rotate: 8 }, { xPercent: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: casco, start: 'top bottom', end: 'bottom 60%', scrub: true } });

  // ---------- contadores ----------
  document.querySelectorAll('[data-cuenta]').forEach(function (el) {
    var fin = +el.dataset.cuenta, dec = +(el.dataset.decimal || 0), o = { v: 0 };
    el.textContent = dec ? '0,0' : '0';
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { g.to(o, { v: fin, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = o.v.toFixed(dec).replace('.', ','); } }); } });
  });

  // ---------- entradas al verse ----------
  g.utils.toArray('[data-revela]').forEach(function (el, i) {
    g.to(el, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: (i % 4) * .07, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });

  // ---------- parallax interior de las fotos ----------
  g.utils.toArray('[data-parallax-caja]').forEach(function (caja) {
    var im = caja.querySelector('.parallax'); if (!im) return;
    g.fromTo(im, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: caja, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---------- lema gigante de fondo: se desliza en horizontal ----------
  g.utils.toArray('[data-lema] span').forEach(function (el) {
    g.fromTo(el, { xPercent: 0 }, { xPercent: -24, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---------- plano: se despliega en 3D con el scroll, pasa un escáner, se dibujan las estancias, cuentan los m² y empieza el recorrido ----------
  if (plano) {
    var lienzo = plano.querySelector('[data-plano-lienzo]');
    g.fromTo(lienzo, { rotateX: 58, scale: .8, yPercent: 10, transformPerspective: 1400 }, { rotateX: 0, scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: plano, start: 'top 95%', end: 'top 20%', scrub: true } });
    ST.create({ trigger: lienzo, start: 'top 78%', once: true, onEnter: function () {
      g.timeline().to(plano.querySelector('.plano__escaner'), { opacity: 1, duration: .2 }).to(plano.querySelector('.plano__escaner'), { top: '100%', duration: 1.5, ease: 'power1.inOut' }).to(plano.querySelector('.plano__escaner'), { opacity: 0, duration: .3 });
      g.to(zonas, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .13, delay: .2 });
      plano.querySelectorAll('[data-m2]').forEach(function (el) {
        var fin = +el.dataset.m2, dec = fin % 1 ? 1 : 0, o = { v: 0 };
        g.to(o, { v: fin, duration: 1.6, ease: 'power3.out', delay: .2, onUpdate: function () { el.textContent = o.v.toFixed(dec).replace('.', ','); } });
      });
      g.delayedCall(2, function () { plano._listo = true; plano._activa(0); plano._recorrido(true); });
    } });
    ST.create({ trigger: plano, start: 'top bottom', end: 'bottom top', onToggle: function (st) { if (plano._listo) plano._recorrido(st.isActive); } });
  }

  // ---------- comparadores: barrido de muestra la primera vez que se ven ----------
  document.querySelectorAll('[data-comp]').forEach(function (c) {
    ST.create({ trigger: c, start: 'top 70%', once: true, onEnter: function () { c._barre(); } });
  });

  addEventListener('load', function () { ST.refresh(); });
})();
