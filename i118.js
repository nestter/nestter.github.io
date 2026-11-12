    // Переключение языка (EN / RU)
  (function () {
    const dict = {
      en: {
        title: 'Nestter',
        desc: 'Nestter — 3D modeler. Weapons, vehicles, props and characters. Close for commissions. Portfolio and key links.',
        tag: '3D Modeler &nbsp;·&nbsp; Close for orders',
        bio: 'Let’s get acquainted, traveler! In my free time, I model various inanimate objects (vehicles, weapons, props), create my own characters, and do a bit of drawing.\nI am available for short-term collaborations or one-off commissions.',
        projects: 'Projects',
        projects_sub: 'currently involved in',
        st_work: 'In progress',
        st_hold: 'On hold',
        role_3d: '3D modeler',
        role_tr: 'Translator',
        desc_nec: 'Weapons, vehicles, props',
        desc_irons: 'Translating the mod into Russian',
        type_game: 'video game',
        type_mod: 'Minecraft mod',
        footer: '© nestter · 3D modeler',
        warn: '⚠️ Your browser is outdated. Some design elements (such as glass effects, images and fonts) may not display correctly. Please update or replace your browser.',
        sun: 'The Sun has returned...',
        doc: '404 - Page not found',
        titlen: 'Page not found',
        note: 'The link may be outdated, or the page was moved.',
        home: 'Go to home'
      },
      ru: {
        title: 'Nestter',
        desc: 'Nestter — 3D-моделлер. Оружие, транспорт, пропсы и персонажи. Закрыт для заказов. Портфолио и основные ссылки.',
        tag: '3D-моделлер &nbsp;·&nbsp; Закрыт для заказов',
        bio: 'Давай знакомиться, путник! В свободное время я моделирую разные неодушевлённые объекты (транспорт, оружие, пропы), создаю собственных персонажей и немного рисую.\nДоступен для временного найма и разовых заказов.',
        projects: 'Проекты',
        projects_sub: 'в которых участвую',
        st_work: 'В процессе',
        st_hold: 'Перерыв',
        role_3d: '3D-моделлер',
        role_tr: 'Переводчик',
        desc_nec: 'Оружие, транспорт, пропы',
        desc_irons: 'Перевод мода на русский язык',
        type_game: 'Видеоигра',
        type_mod: 'Minecraft мод',
        footer: '© nestter · 3D-моделлер',
        warn: '⚠️ Ваш браузер устарел. Некоторые элементы оформления (эффект стекла, изображения, шрифты) могут отображаться неправильно. Пожалуйста, обновите или замените браузер.',
        sun: 'Солнце возвращено...', 
        titlen: 'Страница не найдена',
        doc: '404 - Страница не найдена',
        note: 'Ссылка могла устареть, или страницу перенесли.',
        home: 'На главную'
      }
    };

    function detect() {
      try {
        const saved = localStorage.getItem('lang');
        if (saved === 'en' || saved === 'ru') return saved;
      } catch (e) {}
      return (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en';
    }

    function apply(lang) {
  const d = dict[lang];
  document.documentElement.lang = lang;

  var page = document.documentElement.getAttribute('data-page');
  var titleKey = page === 'notFound' ? 'doc' : 'title';
  if (d[titleKey]) document.title = d[titleKey];

  const meta = document.querySelector('meta[name="description"]');
  if (meta && d.desc) meta.setAttribute('content', d.desc);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (d[key] !== undefined) el.innerHTML = d[key];
  });

  document.querySelectorAll('.lang button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', b.dataset.lang === lang);
  });

  document.documentElement.classList.remove('i18n-loading');
}
      window.applyLang = apply;

    document.querySelectorAll('.lang button').forEach(b => {
      b.addEventListener('click', () => {
        apply(b.dataset.lang);
        try { localStorage.setItem('lang', b.dataset.lang); } catch (e) {}
      });
    });

    apply(detect());
  })();