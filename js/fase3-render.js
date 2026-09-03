/* ==========================================================================
   NAVIDA — Rendering Fase 3
   Estende il renderer comune senza duplicare cornice, editor o sincronizzazione.
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var R = window.NavidaRender;
  var h = R.h;
  var icon = R.icon;
  var Screens = R.screens;

  function text(screen, key, fallback, tag, cls) {
    return h(tag || 'span', {
      class: cls || '',
      'data-editable': screen.id + '.' + key,
      text: S.text(screen.id + '.' + key, fallback)
    });
  }

  function go(id) {
    return function () { window.NavidaApp.goTo(id); };
  }

  function topBar(screen, opts) {
    opts = opts || {};
    return h('div', { class: 'f3-topbar' }, [
      opts.back ? h('button', { class: 'f3-iconbtn', 'aria-label': 'Indietro', onclick: go(opts.back) }, [icon('chevron-left', 24)]) :
        h('button', { class: 'f3-avatar', 'aria-label': 'Apri il profilo', onclick: go('profilo') }, [h('img', { src: profileData().avatar, alt: '' })]),
      opts.identity ? h('div', { class: 'f3-identity' }, [
        text(screen, 'greeting', screen.greeting || 'Bentornato', 'span', 'f3-kicker'),
        text(screen, 'name', screen.name || 'Marco Bacchin', 'strong', 'f3-name')
      ]) : h('div', { class: 'f3-topbar__spacer' }),
      opts.bell === false ? null : h('button', { class: 'f3-iconbtn f3-bell', 'aria-label': 'Notifiche', onclick: go('notifiche') }, [icon('bell', 23), h('span', { class: 'f3-dot' })])
    ].filter(Boolean));
  }

  function stat(iconName, tone, label, value) {
    return h('div', { class: 'f3-stat' }, [
      h('span', { class: 'f3-stat__icon f3-tone--' + tone }, [icon(iconName, 21)]),
      h('span', { class: 'f3-stat__label', text: label }),
      h('strong', { class: 'f3-stat__value', text: value })
    ]);
  }

  function courseLogo(kind) {
    if (kind === 'rivoluzione' || kind === 'public') {
      return h('div', { class: 'f3-courseLogo f3-courseLogo--sponsor' }, [
        h('img', { src: 'assets/fase3/catalog-sponsor.png', alt: 'Rivoluzione Umana' })
      ]);
    }
    return h('div', { class: 'f3-courseLogo' }, [
      h('img', { src: 'assets/fase3/catalog-course.png', alt: 'Coursera' })
    ]);
  }

  function courseData(kind) {
    var map = {
      figma: { provider: 'Coursera', title: 'Figma 101', rating: '4.7', meta: 'Corso online · 6 ore', price: '€22.99' },
      project: { provider: 'Coursera', title: 'Corso Project Management Base', rating: '4.5', meta: 'Corso online · 6 ore', price: '€44.99' },
      ux: { provider: 'Coursera', title: 'Fondamenti ux ui design', rating: '4.7', meta: 'Corso online · 6 ore', price: '€54.99' },
      excel: { provider: 'Coursera', title: 'Excel avanzato per amministrativi', rating: '4.5', meta: 'Corso online · 6 ore', price: '€39.99' },
      rivoluzione: { provider: 'Rivoluzione Umana', title: 'Consulenza di carriera', rating: '4.2', meta: 'Consulenza · 60m', price: '1 gratuita', sponsor: true },
      public: { provider: 'Rivoluzione Umana', title: 'Corso public speaking', rating: '4.1', meta: 'Corso remoto · 120m', price: 'Gratuito', sponsor: true }
    };
    return map[kind];
  }

  function courseCard(screen, kind, index, compact) {
    var d = courseData(kind);
    return h('button', { class: 'f3-course' + (compact ? ' f3-course--compact' : ''), onclick: go('dettaglio') }, [
      courseLogo(kind),
      h('span', { class: 'f3-course__body' }, [
        h('span', { class: 'f3-course__provider', text: d.provider }),
        text(screen, 'course.' + index + '.title', d.title, 'strong', 'f3-course__title'),
        h('span', { class: 'f3-course__rating' }, [h('span', { text: '★ ' + d.rating }), h('small', { text: d.sponsor ? '(2k)' : '(125k)' })]),
        h('span', { class: 'f3-course__meta', text: d.meta }),
        h('span', { class: 'f3-course__price', text: d.price })
      ]),
      d.sponsor ? h('span', { class: 'f3-sponsored', text: 'Sponsor' }) : null,
      h('span', { class: 'f3-course__link' }, ['Dettagli ', icon('chevron-right', 12)])
    ].filter(Boolean));
  }

  Screens.dashboardHome = function (screen) {
    if (S.pageVariant(screen.id, 'attiva') === 'vuota') {
      return h('div', { class: 'f3-page f3-home f3-home--empty' }, [
        topBar(screen, { identity: true }),
        h('div', { class: 'f3-stats' }, [
          stat('book-open', 'neutral', 'In corso', '0'),
          stat('award', 'neutral', 'Completati', '0'),
          stat('trending-up', 'neutral', 'Ore totali', '0h')
        ]),
        h('section', { class: 'f3-emptyStart' }, [
          h('span', { class: 'f3-emptyStart__icon' }, [icon('rocket', 37)]),
          text(screen, 'emptyTitle', 'Il tuo percorso inizia ora', 'h1', ''),
          text(screen, 'emptyBody', 'Scegli un elemento dal catalogo per iniziare a costruire le tue competenze', 'p', ''),
          h('button', { onclick: go('catalogo') }, [icon('search', 17), ' Esplora i contenuti'])
        ]),
        h('section', { class: 'f3-mood' }, [
          h('h2', { text: 'Mood tracker' }),
          h('div', { class: 'f3-mood__card' }, [h('p', { text: 'Come ti senti oggi?' }), h('div', {}, ['😔', '🙁', '😐', '🙂', '😁'].map(function (m) { return h('button', { text: m }); }))])
        ]),
        h('section', { class: 'f3-startHere' }, [
          h('h2', { text: 'Inizia da qui' }),
          h('button', { onclick: go('percorso') }, [h('span', {}, [icon('zap', 23)]), h('div', {}, [h('strong', { text: 'Esplora il percorso di carriera' }), h('small', { text: 'Scopri dove puoi migliorare' })]), icon('chevron-right', 18)])
        ])
      ]);
    }
    return h('div', { class: 'f3-page f3-home' }, [
      topBar(screen, { identity: true }),
      h('div', { class: 'f3-stats' }, [
        stat('book-open', 'violet', 'In corso', '1'),
        stat('award', 'mint', 'Completati', '12'),
        stat('trending-up', 'orange', 'Ore totali', '48h')
      ]),
      h('button', { class: 'f3-goal', onclick: go('percorso') }, [
        h('div', { class: 'f3-goal__copy' }, [
          text(screen, 'monthlyTitle', screen.monthlyTitle, 'h2', ''),
          text(screen, 'monthlyBody', screen.monthlyBody, 'p', ''),
          h('div', { class: 'f3-goal__meta' }, [
            h('span', {}, [icon('target', 15), ' 3/4 corsi']),
            h('span', {}, [icon('clock', 15), ' 18h/20h'])
          ])
        ]),
        h('div', { class: 'f3-ring', 'aria-label': '75 per cento' }, [h('strong', { text: '75%' })])
      ]),
      h('section', { class: 'f3-section' }, [
        h('div', { class: 'f3-section__head' }, [
          text(screen, 'activeTitle', screen.activeTitle, 'h2', ''),
          h('button', { onclick: go('catalogo') }, ['Vedi tutti ', icon('chevron-right', 14)])
        ]),
        courseCard(screen, 'ux', 0)
      ]),
      h('section', { class: 'f3-section' }, [
        h('div', { class: 'f3-section__head' }, [text(screen, 'eventTitle', screen.eventTitle, 'h2', '')]),
        h('button', { class: 'f3-event', onclick: go('dettaglio') }, [
          h('div', { class: 'f3-date' }, [h('strong', { text: '15' }), h('span', { text: 'MAR' })]),
          h('div', { class: 'f3-event__copy' }, [
            h('small', { text: 'Scuola Italiana Design' }),
            h('strong', { text: 'Workshop di introduzione all’AI generativa' }),
            h('span', { text: '♙ 98 partecipanti' }),
            h('span', { text: '▣ Evento   ◷ 120m' }),
            h('em', { text: 'EVENTO' })
          ]),
          h('span', { class: 'f3-course__link' }, ['Dettagli ', icon('chevron-right', 12)])
        ])
      ])
    ]);
  };

  Screens.dashboardNotifications = function (screen) {
    if (S.pageVariant(screen.id, 'attive') === 'vuote') {
      return h('div', { class: 'f3-page f3-notifications f3-notifications--empty' }, [
        topBar(screen, { back: 'dashboard', bell: false }),
        text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'),
        h('section', { class: 'f3-emptyNotifications' }, [
          h('span', { class: 'f3-emptyNotifications__icon' }, [icon('bell', 45)]),
          text(screen, 'emptyTitle', 'Nessuna notifica', 'h2', ''),
          text(screen, 'emptyBody', 'Le tue notifiche appariranno qui. Ti aggiorneremo su corsi, progressi e novità.', 'p', '')
        ])
      ]);
    }
    return h('div', { class: 'f3-page f3-notifications' }, [
      topBar(screen, { back: 'dashboard', bell: false }),
      text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'),
      h('div', { class: 'f3-notificationList' }, screen.items.map(function (item, i) {
        return h('article', { class: 'f3-notification' }, [
          h('span', { class: 'f3-notification__icon f3-tone--' + item.tone }, [icon(item.icon, 23)]),
          h('div', { class: 'f3-notification__copy' }, [
            text(screen, 'item.' + i + '.title', item.title, 'h2', ''),
            text(screen, 'item.' + i + '.text', item.text, 'p', '')
          ]),
          h('time', { text: item.time })
        ]);
      }))
    ]);
  };

  function pathList(screen) {
    return h('div', { class: 'f3-pathList' }, screen.steps.map(function (step, i) {
      return h('button', { class: 'f3-pathCard is-' + step.state, onclick: step.state === 'active' ? go('catalogo') : null }, [
        h('span', { class: 'f3-pathState' }, [step.state === 'done' ? icon('check', 18) : step.state === 'goal' ? icon('award', 18) : null]),
        h('span', { class: 'f3-pathCard__copy' }, [
          h('small', { text: step.label }),
          text(screen, 'step.' + i + '.role', step.role, 'strong', ''),
          step.duration ? h('span', {}, [icon('clock', 13), ' ' + step.duration]) : null
        ]),
        icon('chevron-right', 20)
      ].filter(Boolean));
    }));
  }

  function pathCurve(screen, variant) {
    var first = screen.steps[0], second = screen.steps[1];
    return h('div', { class: 'f3-curve f3-curve--' + variant }, [
      h('div', { class: 'f3-curveLine' }),
      h('span', { class: 'f3-curveDot f3-curveDot--done' }, [icon('check', 19)]),
      h('button', { class: 'f3-curveCard f3-curveCard--one', onclick: go('catalogo') }, [
        h('small', { text: first.label }),
        text(screen, 'step.0.role', first.role, 'strong', ''),
        h('span', {}, [icon('clock', 13), ' ' + first.duration])
      ]),
      h('span', { class: 'f3-curveDot f3-curveDot--active' }),
      h('button', { class: 'f3-curveCard f3-curveCard--two', onclick: go('catalogo') }, [
        h('small', { text: second.label }),
        text(screen, 'step.1.role', second.role, 'strong', ''),
        h('span', {}, [icon('clock', 13), ' ' + second.duration])
      ])
    ]);
  }

  Screens.careerPath = function (screen) {
    var variant = S.pageVariant(screen.id, 'lista');
    var children = [variant === 'lista' ? topBar(screen, { back: 'dashboard', bell: false }) : topBar(screen, { identity: true })];
    children.push(text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'));
    if (variant === 'lista') {
      children.push(h('section', { class: 'f3-pathSummary' }, [
        h('div', {}, [text(screen, 'summaryTitle', 'Il tuo percorso', 'h2', ''), text(screen, 'intro', screen.intro, 'p', ''), h('span', {}, ['◉ 1 completato', '   ◯ 4 da fare'])]),
        h('div', { class: 'f3-ring f3-ring--small' }, [h('strong', { text: '20%' })])
      ]));
      children.push(pathList(screen));
    } else {
      children.push(pathCurve(screen, variant));
    }
    return h('div', { class: 'f3-page f3-path f3-path--' + variant }, children);
  };

  Screens.careerCatalog = function (screen) {
    var idx = 0;
    return h('div', { class: 'f3-page f3-catalog' }, [
      topBar(screen, { back: 'percorso', bell: false }),
      h('section', { class: 'f3-roleCard' }, [
        text(screen, 'role', screen.role, 'h1', ''),
        text(screen, 'roleDescription', screen.roleDescription, 'p', ''),
        h('div', {}, [h('span', { text: '⌁ 28 opportunità' }), h('span', { text: '★ 2 consigliati' })])
      ]),
      h('div', { class: 'f3-filterbar' }, [
        ['Tutti', 'Formazione', 'Contenuti', 'Eventi'].map(function (label, i) { return h('button', { class: i === 0 ? 'is-active' : '', text: label }); }),
        h('button', { class: 'f3-filterBtn', 'aria-label': 'Apri filtri', onclick: go('filtri') }, [icon('filter', 17)])
      ].flat()),
      h('div', { class: 'f3-catalogGroups' }, screen.groups.map(function (group) {
        return h('section', { class: 'f3-catalogGroup' }, [
          h('div', { class: 'f3-catalogGroup__title' }, [h('h2', { text: group.title }), h('span', { text: group.items.length })]),
          h('div', { class: 'f3-catalogGroup__items' }, group.items.map(function (kind) { return courseCard(screen, kind, idx++, true); }))
        ]);
      }))
    ]);
  };

  Screens.careerDetail = function (screen) {
    return h('div', { class: 'f3-page f3-detail' }, [
      h('header', { class: 'f3-detailHero' }, [
        h('img', { src: 'assets/fase3/detail-hero.png', alt: '' }),
        h('div', { class: 'f3-detailHero__shade' }),
        h('button', { class: 'f3-detailBack', 'aria-label': 'Indietro', onclick: go('catalogo') }, [icon('arrow-left', 24)]),
        h('button', { class: 'f3-detailSettings', 'aria-label': 'Impostazioni contenuto', onclick: go('impostazioni') }, [icon('settings', 23)]),
        h('div', { class: 'f3-detailHero__copy' }, [
          h('div', { class: 'f3-detailBadges' }, [h('span', { text: screen.provider }), h('span', { text: '★ ' + screen.rating })]),
          text(screen, 'title', screen.title, 'h1', ''),
          h('div', { class: 'f3-detailMeta' }, [h('span', {}, [icon('video', 16), ' Online']), h('span', {}, [icon('clock', 16), ' 56 ore']), h('span', {}, [icon('users', 16), ' 125k+'])])
        ])
      ]),
      h('div', { class: 'f3-detailBody' }, [
        h('div', { class: 'f3-detailStats' }, [
          stat('trending-up', 'violet', 'Livello', 'Intermedio'),
          stat('award', 'violet', 'Certificato', 'Incluso'),
          stat('users', 'violet', 'Studenti', '125k+')
        ]),
        h('section', { class: 'f3-priceCard' }, [
          h('div', {}, [text(screen, 'priceLabel', screen.priceLabel, 'span', ''), h('p', {}, [text(screen, 'price', screen.price, 'strong', ''), text(screen, 'priceSuffix', screen.priceSuffix, 'small', '')])]),
          h('button', { onclick: function () { R.toast('Iscrizione simulata nel prototipo.'); } }, [text(screen, 'cta', screen.cta, 'span', '')])
        ]),
        h('section', { class: 'f3-keypoints' }, [
          text(screen, 'pointsTitle', screen.pointsTitle, 'h2', ''),
          h('ul', {}, screen.points.map(function (point, i) { return h('li', {}, [h('span', {}, [icon('check', 14)]), text(screen, 'point.' + i, point, 'span', '')]); }))
        ]),
        h('div', { class: 'f3-gallery' }, [
          h('img', { src: 'assets/fase3/detail-gallery-1.png', alt: '' }),
          h('img', { src: 'assets/fase3/detail-gallery-2.png', alt: '' }),
          h('img', { src: 'assets/fase3/detail-gallery-3.png', alt: '' })
        ])
      ])
    ]);
  };

  function chipGroup(title, values) {
    return h('fieldset', { class: 'f3-chipGroup' }, [
      h('legend', { text: title }),
      h('div', {}, values.map(function (label) {
        return h('button', { type: 'button', text: label, onclick: function (e) { e.currentTarget.classList.toggle('is-selected'); } });
      }))
    ]);
  }

  Screens.careerFilters = function (screen) {
    return h('div', { class: 'f3-page f3-overlay' }, [
      h('section', { class: 'f3-filterModal' }, [
        h('div', { class: 'f3-modalHead' }, [text(screen, 'title', screen.title, 'h1', ''), h('button', { 'aria-label': 'Chiudi', onclick: go('catalogo') }, [icon('x', 24)])]),
        chipGroup('Categoria', ['Formazione', 'Contenuti', 'Eventi', 'Consulenza']),
        chipGroup('Sottocategoria', ['Podcast', 'Soft skill', 'Volontariato', 'Networking', 'Progetti', 'Risorse', 'Supporto RU', 'Mentor', 'Libri']),
        chipGroup('Formato', ['Online', 'Da remoto', 'In presenza', 'Articoli', 'Podcast', 'Video']),
        chipGroup('Durata', ['›5h', '5–24h', '1–5g', '5g–30g', '1–6 mesi', '6–12 mesi']),
        chipGroup('Prezzo', ['Gratuito', '€0–€25', '€25–€50', '€50–€100', '€100–€250', '€250+']),
        h('div', { class: 'f3-modalActions' }, [
          h('button', { class: 'f3-btnOutline', onclick: function () { document.querySelectorAll('.f3-chipGroup .is-selected').forEach(function (n) { n.classList.remove('is-selected'); }); } }, ['Resetta']),
          h('button', { class: 'f3-btnPrimary', onclick: go('catalogo') }, ['Applica filtri'])
        ])
      ])
    ]);
  };

  function settingsRow(iconName, title, body, tone, trailing) {
    return h('button', { class: 'f3-settingRow' }, [
      h('span', { class: 'f3-settingRow__icon f3-tone--' + tone }, [icon(iconName, 24)]),
      h('span', { class: 'f3-settingRow__copy' }, [h('strong', { text: title }), h('small', { text: body })]),
      trailing === 'toggle' ? h('span', { class: 'f3-toggle', onclick: function (e) { e.stopPropagation(); e.currentTarget.classList.toggle('is-on'); } }, [h('i')]) : null
    ].filter(Boolean));
  }

  Screens.careerSettings = function (screen) {
    return h('div', { class: 'f3-page f3-overlay f3-overlay--sheet' }, [
      h('section', { class: 'f3-settingsSheet' }, [
        h('div', { class: 'f3-sheetHandle' }),
        h('div', { class: 'f3-modalHead' }, [
          h('div', {}, [text(screen, 'title', screen.title, 'h1', ''), text(screen, 'subtitle', screen.subtitle, 'p', '')]),
          h('button', { 'aria-label': 'Chiudi', onclick: go('dettaglio') }, [icon('x', 23)])
        ]),
        settingsRow('check', 'Segna come completato', 'Aggiungi ai corsi completati', 'mint', 'toggle'),
        h('h2', { class: 'f3-settingsLabel', text: 'GESTIONE' }),
        settingsRow('share-2', 'Condividi', 'Invia a un amico o sui social', 'violet'),
        settingsRow('heart', 'Aggiungi ai preferiti', 'Salva per dopo', 'neutral'),
        settingsRow('eye-off', 'Nascondi elemento', 'Non mostrare più nei suggerimenti', 'neutral'),
        h('h2', { class: 'f3-settingsLabel', text: 'SUPPORTO' }),
        settingsRow('circle-help', 'Contatta supporto', 'Hai bisogno di aiuto?', 'neutral'),
        settingsRow('flag', 'Segnala problema', 'Contenuto non appropriato o errori', 'danger')
      ])
    ]);
  };

  /* ==================================================================
     FASE 4 — PROFILO UTENTE
     ================================================================== */

  var PROFILE_KEY = 'navida-profile-v1';
  var PROFILE_DEFAULTS = {
    firstName: 'Marco', lastName: 'Bacchin', email: 'bacchin.marco03@gmail.com',
    phone: '+39 123405687', address: 'Via Puzza 31', city: 'Albignasego',
    province: 'PD', cap: '35020', occupation: 'Ingegnere strutturale',
    avatar: 'assets/mascotte-salutare.png',
    preferences: { push: true, email: true, sms: false, courses: true, weekly: true, content: true, dark: false, language: 'Italiano', visibility: 'Solo aziende compatibili' }
  };

  function profileData() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; } catch (e) {}
    var data = Object.assign({}, PROFILE_DEFAULTS, saved);
    data.preferences = Object.assign({}, PROFILE_DEFAULTS.preferences, saved.preferences || {});
    if (document.body) document.body.classList.toggle('p4-dark', !!data.preferences.dark);
    return data;
  }

  function saveProfile(data) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function profileHeader(title, back) {
    return h('header', { class: 'p4-header' }, [
      h('button', { class: 'p4-iconbtn', 'aria-label': 'Indietro', onclick: go(back || 'profilo') }, [icon('arrow-left', 24)]),
      h('h1', { text: title }),
      h('span', { class: 'p4-header__space' })
    ]);
  }

  function profileAvatar(editable) {
    var data = profileData();
    return h('button', { class: 'p4-avatar' + (editable ? ' is-editable' : ''), 'aria-label': editable ? 'Cambia foto profilo' : 'Foto profilo', onclick: editable ? go('fotoProfilo') : null }, [
      h('span', { class: 'p4-avatar__image' }, [h('img', { src: data.avatar, alt: '' })]),
      editable ? h('span', { class: 'p4-avatar__camera' }, [icon('camera', 20)]) : null
    ].filter(Boolean));
  }

  function infoField(label, value) {
    return h('div', { class: 'p4-infoField' }, [h('strong', { text: label }), h('span', { text: value })]);
  }

  function menuRow(iconName, label, action, danger) {
    return h('button', { class: 'p4-menuRow' + (danger ? ' is-danger' : ''), onclick: action }, [icon(iconName, 20), h('span', { text: label }), icon('chevron-right', 18)]);
  }

  Screens.profileHome = function () {
    var d = profileData();
    return h('div', { class: 'p4-page p4-home' }, [
      h('div', { class: 'p4-profileHero' }, [profileAvatar(true), h('h1', { text: d.firstName + ' ' + d.lastName })]),
      h('section', { class: 'p4-section' }, [
        h('h2', { text: 'Anagrafica' }),
        h('div', { class: 'p4-card p4-infoCard' }, [
          infoField('Mail', d.email), infoField('Telefono', d.phone),
          infoField('Residenza', [d.address, d.city + ' (' + d.province + ')'].filter(Boolean).join(', ')),
          infoField('Occupazione attuale', d.occupation)
        ])
      ]),
      h('section', { class: 'p4-section' }, [
        h('h2', { text: 'Impostazioni' }),
        h('div', { class: 'p4-menuList' }, [
          menuRow('person-standing', 'Modifica profilo', go('modificaProfilo')),
          menuRow('pencil-line', 'Ripeti il questionario', function () { window.location.href = 'index.html?screen=introQuestionario'; }),
          menuRow('briefcase-business', 'Cambia lavoro dei sogni', function () { window.location.href = 'index.html?screen=lavoroSogni'; }),
          menuRow('file-user', 'Profilo professionale', go('profiloProfessionale')),
          menuRow('settings-2', 'Preferenze', go('preferenzeProfilo')),
          menuRow('log-out', 'Log out', go('logoutProfilo'), true)
        ])
      ])
    ]);
  };

  function photoChoice(iconName, title, body, action, danger) {
    return h('button', { class: 'p4-photoChoice' + (danger ? ' is-danger' : ''), onclick: action }, [
      icon(iconName, 24), h('span', {}, [h('strong', { text: title }), h('small', { text: body })])
    ]);
  }

  function chooseImage(capture) {
    var input = h('input', { type: 'file', accept: 'image/*', class: 'p4-fileInput' });
    if (capture) input.setAttribute('capture', 'user');
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { var d = profileData(); d.avatar = reader.result; saveProfile(d); window.NavidaApp.goTo('profilo'); };
      reader.readAsDataURL(file);
    });
    document.body.appendChild(input); input.click();
    setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 60000);
  }

  function chooseDocument(message, accept) {
    var input = h('input', { type: 'file', accept: accept || '.pdf,.doc,.docx,image/*', class: 'p4-fileInput' });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) R.toast(message + ': ' + input.files[0].name);
    });
    document.body.appendChild(input); input.click();
    setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 60000);
  }

  Screens.profilePhoto = function (screen) {
    return h('div', { class: 'p4-page p4-overlay' }, [
      h('section', { class: 'p4-photoModal' }, [
        h('div', { class: 'p4-modalHead' }, [h('h1', { text: screen.title }), h('button', { 'aria-label': 'Chiudi', onclick: go('profilo') }, [icon('x', 24)])]),
        profileAvatar(false), h('p', { class: 'p4-photoHint', text: 'Aggiorna la tua foto profilo' }),
        h('div', { class: 'p4-photoChoices' }, [
          photoChoice('camera', 'Scatta una foto', 'Usa la fotocamera', function () { chooseImage(true); }),
          photoChoice('image', 'Scegli dalla galleria', 'Seleziona un’immagine', function () { chooseImage(false); }),
          photoChoice('sparkles', 'Scegli tra i nostri avatar', 'Seleziona una mascotte', function () {
            var d = profileData();
            var avatars = ['assets/mascotte-salutare.png', 'assets/mascotte-computer.png', 'assets/mascotte-indicare.png', 'assets/mascotte-ok.png'];
            d.avatar = avatars[(avatars.indexOf(d.avatar) + 1) % avatars.length]; saveProfile(d); window.NavidaApp.render();
          }),
          photoChoice('trash-2', 'Rimuovi foto', 'Usa immagine predefinita', function () { var d = profileData(); d.avatar = PROFILE_DEFAULTS.avatar; saveProfile(d); window.NavidaApp.goTo('profilo'); }, true)
        ])
      ])
    ]);
  };

  function formField(name, label, value, type, extra) {
    return h('label', { class: 'p4-field' + (extra || '') }, [h('span', { text: label }), h('input', { name: name, type: type || 'text', value: value || '', autocomplete: 'off' })]);
  }

  Screens.profileEdit = function (screen) {
    var d = profileData();
    var form = h('form', { class: 'p4-form', onsubmit: function (e) {
      e.preventDefault(); var fd = new FormData(e.currentTarget);
      ['firstName','lastName','email','phone','address','city','province','cap','occupation'].forEach(function (key) { d[key] = String(fd.get(key) || '').trim(); });
      saveProfile(d); R.toast('Profilo aggiornato'); window.NavidaApp.goTo('profilo');
    } }, [
      h('section', {}, [h('h2', { text: 'Dati personali' }), formField('firstName', 'Nome', d.firstName), formField('lastName', 'Cognome', d.lastName)]),
      h('section', {}, [h('h2', { text: 'Contatti' }), formField('email', 'Email', d.email, 'email'), formField('phone', 'Telefono', d.phone, 'tel')]),
      h('section', {}, [h('h2', { text: 'Residenza' }), formField('address', 'Indirizzo', d.address), formField('city', 'Città', d.city), h('div', { class: 'p4-fieldRow' }, [formField('province', 'Provincia', d.province), formField('cap', 'CAP', d.cap)])]),
      h('section', {}, [h('h2', { text: 'Professione' }), formField('occupation', 'Occupazione attuale', d.occupation)]),
      h('div', { class: 'p4-formSpacer' }),
      h('button', { type: 'submit', class: 'p4-save' }, [icon('save', 22), 'Salva le modifiche'])
    ]);
    return h('div', { class: 'p4-page p4-edit' }, [profileHeader(screen.title), form]);
  };

  function careerBlock(iconName, title, items) {
    return h('section', { class: 'p4-careerBlock' }, [
      h('div', { class: 'p4-careerBlock__head' }, [h('span', {}, [icon(iconName, 20), h('h2', { text: title })]), h('button', { 'aria-label': 'Aggiungi ' + title, onclick: function () { R.toast('Aggiunta simulata nel prototipo.'); } }, [icon('plus', 20)])]),
      h('div', { class: 'p4-card p4-careerItems' }, items.map(function (item) { return h('div', {}, [h('strong', { text: item.title }), h('span', { text: item.meta })]); }))
    ]);
  }

  Screens.profileCareer = function (screen) {
    return h('div', { class: 'p4-page p4-career' }, [
      profileHeader(screen.title),
      h('div', { class: 'p4-scroll' }, [
        h('p', { class: 'p4-intro', text: 'Tutto ciò che racconta il tuo percorso, pronto per creare un CV su misura.' }),
        careerBlock('graduation-cap', 'Formazione', [{ title: 'Laurea magistrale in Ingegneria civile', meta: 'Università di Padova · 2021' }]),
        careerBlock('badge-check', 'Certificazioni', [{ title: 'Sicurezza nei cantieri', meta: 'Aggiornata nel 2025' }]),
        careerBlock('briefcase-business', 'Esperienze lavorative', [{ title: 'Ingegnere strutturale', meta: 'Studio tecnico · 2022–oggi' }]),
        careerBlock('wrench', 'Competenze', [{ title: 'Calcolo strutturale · AutoCAD · Revit', meta: '3 competenze' }]),
        careerBlock('heart-handshake', 'Soft skills', [{ title: 'Problem solving · Precisione · Collaborazione', meta: '3 competenze' }]),
        h('section', { class: 'p4-section p4-careerActions' }, [h('h2', { text: 'Strumenti' }),
          menuRow('file-text', 'Genera il tuo CV', function () { R.toast('Generatore CV simulato nel prototipo.'); }),
          menuRow('upload', 'Carica un CV e compila il profilo', function () { chooseDocument('CV caricato', '.pdf,.doc,.docx'); }),
          menuRow('folder-up', 'Carica il portfolio', function () { chooseDocument('Portfolio caricato'); })
        ])
      ])
    ]);
  };

  function togglePreference(data, key, iconName, title, body) {
    return h('button', { class: 'p4-prefRow', onclick: function (e) {
      data.preferences[key] = !data.preferences[key]; saveProfile(data); e.currentTarget.querySelector('.p4-toggle').classList.toggle('is-on', data.preferences[key]);
      if (key === 'dark') document.body.classList.toggle('p4-dark', data.preferences[key]);
    } }, [h('span', { class: 'p4-prefIcon' }, [icon(iconName, 20)]), h('span', { class: 'p4-prefCopy' }, [h('strong', { text: title }), h('small', { text: body })]), h('span', { class: 'p4-toggle' + (data.preferences[key] ? ' is-on' : '') }, [h('i')])]);
  }

  function prefSection(title, rows) { return h('section', { class: 'p4-prefSection' }, [h('h2', { text: title }), h('div', { class: 'p4-prefList' }, rows)]); }

  Screens.profilePreferences = function (screen) {
    var d = profileData();
    function selectRow(iconName, title, key, options) {
      var select = h('select', { 'aria-label': title, onchange: function (e) { d.preferences[key] = e.target.value; saveProfile(d); } }, options.map(function (v) { return h('option', { value: v, text: v, selected: d.preferences[key] === v }); }));
      return h('div', { class: 'p4-selectRow' }, [h('div', {}, [h('span', { class: 'p4-prefIcon' }, [icon(iconName, 20)]), h('strong', { text: title })]), select]);
    }
    return h('div', { class: 'p4-page p4-preferences' }, [profileHeader(screen.title), h('div', { class: 'p4-scroll' }, [
      prefSection('Notifiche', [togglePreference(d,'push','bell','Notifiche push','Ricevi notifiche sul tuo dispositivo'), togglePreference(d,'email','mail','Notifiche email','Ricevi aggiornamenti via email'), togglePreference(d,'sms','message-square','Notifiche SMS','Ricevi messaggi importanti via SMS')]),
      prefSection('Promemoria e Aggiornamenti', [togglePreference(d,'courses','bell','Promemoria corsi','Ricorda i corsi in programma'), togglePreference(d,'weekly','mail','Riepilogo settimanale','Ricevi un riepilogo dei tuoi progressi'), togglePreference(d,'content','bell','Nuovi contenuti','Notifica quando ci sono nuovi corsi')]),
      prefSection('Aspetto', [togglePreference(d,'dark','moon','Modalità scura','Usa tema scuro per l’interfaccia')]),
      prefSection('Lingua e Regione', [selectRow('globe', 'Lingua dell’app', 'language', ['Italiano','English'])]),
      prefSection('Privacy', [selectRow('lock', 'Visibilità profilo', 'visibility', ['Solo aziende compatibili','Tutte le aziende','Profilo privato'])]),
      h('p', { class: 'p4-autosave', text: 'Le modifiche vengono salvate automaticamente' })
    ])]);
  };

  Screens.profileLogout = function (screen) {
    return h('div', { class: 'p4-page p4-overlay' }, [h('section', { class: 'p4-confirm' }, [
      h('h1', { text: screen.title }), h('div', {}, [h('button', { class: 'p4-cancel', onclick: go('profilo'), text: 'Annulla' }), h('button', { class: 'p4-danger', onclick: function () { window.location.href = 'index.html'; }, text: 'Esci' })])
    ])]);
  };
})();
