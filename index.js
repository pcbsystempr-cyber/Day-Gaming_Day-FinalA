(function() {
  'use strict';

  const DATA_KEYS = {
    torneo: 'proximoTorneo',
    reglas: 'reglas',
    galeria: 'galeria',
    page: 'pageContent'
  };

  let countdownIntervalId = null;
  let galleryAutoplayId = null;
  let musicModalInitialized = false;

  function loadData(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function mergeDeep(baseValue, overrideValue) {
    if (Array.isArray(baseValue)) {
      return Array.isArray(overrideValue) ? overrideValue : baseValue.slice();
    }

    if (baseValue && typeof baseValue === 'object') {
      const result = {};
      const overrideObject = overrideValue && typeof overrideValue === 'object' ? overrideValue : {};

      Object.keys(baseValue).forEach(function(key) {
        result[key] = mergeDeep(baseValue[key], overrideObject[key]);
      });

      Object.keys(overrideObject).forEach(function(key) {
        if (!(key in result)) {
          result[key] = overrideObject[key];
        }
      });

      return result;
    }

    return overrideValue !== undefined ? overrideValue : baseValue;
  }

  function getPageContent() {
    if (window.GamingDayRegistrationSync) {
      window.GamingDayRegistrationSync.normalizePageContentRegistrationLinks();
    }
    return mergeDeep(DEFAULT_PAGE_CONTENT, loadData(DATA_KEYS.page, {}));
  }

  function getRegistrationUrl(url) {
    if (window.GamingDayRegistrationSync) {
      return window.GamingDayRegistrationSync.getRegistrationUrl(url);
    }

    return cleanText(url);
  }

  function getVerifierRegistrations(content) {
    const manualRegistrations = content && content.verifier ? content.verifier.registrations : [];
    if (window.GamingDayRegistrationSync) {
      return window.GamingDayRegistrationSync.getMergedRegistrations(manualRegistrations);
    }

    return Array.isArray(manualRegistrations) ? manualRegistrations : [];
  }

  function normalizeVerifierValue(value) {
    return cleanText(value).toLowerCase();
  }

  function findRegistrationMatch(registrations, query) {
    return (Array.isArray(registrations) ? registrations : []).find(function(registration) {
      const email = normalizeVerifierValue(registration.email);
      const name = normalizeVerifierValue(registration.name);
      const code = normalizeVerifierValue(registration.code);
      return email === query || name === query || code === query;
    });
  }

  function cleanText(value) {
    if (typeof value !== 'string') {
      return value == null ? '' : String(value);
    }

    return value
      .replace(/\\n/g, ' ')
      .replace(/\r?\n/g, ' ')
      .trim();
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = cleanText(value);
    }
  }

  function setHtml(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = value;
    }
  }

  function setLink(id, text, href) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = cleanText(text);
    element.href = cleanText(href);
  }

  function renderHeader(content) {
    setText('site-title', content.header.title);
    setText('site-subtitle', content.header.subtitle);
    setText('footer-brand-title', content.header.title);
    setLink('pcb-link-desktop', content.header.pcbLabel, content.header.pcbHref);
    setLink('pcb-link-mobile', content.header.pcbMobileLabel, content.header.pcbHref);
  }

  function renderNotification(content) {
    const banner = document.getElementById('notification-banner');
    if (!banner) return;

    if (content.notification.visible === false) {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    setText('notification-title', content.notification.title);
    setText('notification-content', content.notification.message);
  }

  function renderHero(content) {
    setText('hero-title', content.hero.title);
    setText('hero-subtitle', content.hero.subtitle);
    setLink('hero-primary-link', content.hero.primaryButtonLabel, getRegistrationUrl(content.hero.primaryButtonHref));
    setLink('hero-secondary-link', content.hero.secondaryButtonLabel, content.hero.secondaryButtonHref);
    setText('cd-label', content.hero.countdownLabel);
    setText('cd-days-label', content.hero.countdownUnits.days);
    setText('cd-hours-label', content.hero.countdownUnits.hours);
    setText('cd-minutes-label', content.hero.countdownUnits.minutes);
    setText('cd-seconds-label', content.hero.countdownUnits.seconds);
    initCountdown(content.hero);
  }

  function initCountdown(heroContent) {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }

    const target = new Date(heroContent.countdownTarget);
    const container = document.getElementById('countdown-container');
    if (!container || Number.isNaN(target.getTime())) return;

    function updateCountdown() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        container.innerHTML = '<p class="text-2xl font-bold text-green-400">' + cleanText(heroContent.liveMessage) + '</p>';
        setText('cd-label', '');
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setText('cd-days', String(days).padStart(2, '0'));
      setText('cd-hours', String(hours).padStart(2, '0'));
      setText('cd-minutes', String(minutes).padStart(2, '0'));
      setText('cd-seconds', String(seconds).padStart(2, '0'));
    }

    updateCountdown();
    countdownIntervalId = setInterval(updateCountdown, 1000);
  }

  function renderAbout(content) {
    setText('about-title', content.about.title);
    setText('about-body', content.about.body);
    setText('about-objective-title', content.about.objectiveTitle);
    setText('about-objective-body', content.about.objectiveBody);
  }

  function renderGames(content) {
    setText('games-title', content.games.title);
    setText('games-description', content.games.description);

    const container = document.getElementById('games-list');
    if (!container) return;

    container.innerHTML = content.games.items.map(function(item) {
      const isPrimary = item.style !== 'secondary';
      const classes = isPrimary
        ? 'bg-indigo-600 px-3 md:px-5 py-2 md:py-3 rounded-md font-semibold shadow hover:opacity-95 text-sm md:text-base'
        : 'bg-white/10 px-3 md:px-5 py-2 md:py-3 rounded-md font-semibold shadow hover:opacity-95 text-sm md:text-base';
      const badge = item.badge
        ? '<span class="absolute -top-2 -right-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">' + cleanText(item.badge) + '</span>'
        : '';

      return '<a href="' + cleanText(item.href) + '" class="' + classes + (item.badge ? ' relative' : '') + '">' + cleanText(item.title) + badge + '</a>';
    }).join('');
  }

  function renderUpcomingMeta(content) {
    setText('upcoming-title', content.upcoming.title);
    setText('upcoming-description', content.upcoming.description);
  }

  function renderTorneo() {
    const data = loadData(DATA_KEYS.torneo, DEFAULT_PROXIMO_TORNEO);
    const container = document.getElementById('torneo-content');
    const box = document.getElementById('torneo-box');
    if (!container || !box) return;

    const isCancelado = data.status === 'cancelado';
    box.className = 'w-full max-w-md p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl border-4 relative text-white ' +
      (isCancelado
        ? 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-red-600'
        : 'bg-gradient-to-r from-green-900 via-green-800 to-green-900 border-green-600');

    container.innerHTML = [
      '<div class="mb-4"><span class="bg-black/40 px-3 py-1 rounded-full text-sm font-bold">' + (isCancelado ? 'CANCELADO ❌' : 'ACTIVO 🔥') + '</span></div>',
      '<h4 class="text-lg md:text-xl font-bold mb-2">' + cleanText(data.title) + '</h4>',
      '<p class="text-sm md:text-base mb-3 text-gray-200">' + cleanText(data.message) + '</p>',
      '<div class="text-sm space-y-1 text-gray-300">',
      '<p>📅 ' + cleanText(data.date) + '</p>',
      '<p>⏰ ' + cleanText(data.time) + '</p>',
      '</div>'
    ].join('');
  }

  function renderSchedule(content) {
    setText('schedule-title', content.schedule.title);
    const columns = content.schedule.columns || [];
    const first = columns[0] || { items: [], secondaryItems: [] };
    const second = columns[1] || { items: [] };

    setText('schedule-col-1-title', first.title || '');
    setHtml('schedule-col-1-items', (first.items || []).map(function(item) {
      return '<li>' + cleanText(item) + '</li>';
    }).join(''));
    setText('schedule-col-1-secondary-title', first.secondaryTitle || '');
    setHtml('schedule-col-1-secondary-items', (first.secondaryItems || []).map(function(item) {
      return '<li>' + cleanText(item) + '</li>';
    }).join(''));

    setText('schedule-col-2-title', second.title || '');
    setHtml('schedule-col-2-items', (second.items || []).map(function(item) {
      return '<li>' + cleanText(item) + '</li>';
    }).join(''));
  }

  function renderBracket(content) {
    setText('bracket-title', content.bracket.title);
    setText('bracket-description', content.bracket.description);

    const body = document.getElementById('bracket-body');
    if (!body) return;

    body.innerHTML = (content.bracket.rows || []).map(function(row) {
      return [
        '<tr class="hover:bg-white/5 transition-colors">',
        '<td class="px-4 py-3 font-semibold">' + cleanText(row.game) + '</td>',
        '<td class="px-4 py-3 text-gray-400">' + cleanText(row.first) + '</td>',
        '<td class="px-4 py-3 text-gray-400">' + cleanText(row.second) + '</td>',
        '<td class="px-4 py-3 text-gray-400">' + cleanText(row.third) + '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function renderRulesMeta(content) {
    setText('rules-title', content.rules.title);
    setText('rules-description', content.rules.description);
  }

  function renderRules() {
    const data = loadData(DATA_KEYS.reglas, DEFAULT_REGLAS);
    const container = document.getElementById('reglas-list');
    if (!container) return;
    container.innerHTML = data.map(function(rule) {
      return '<li>• ' + cleanText(rule) + '</li>';
    }).join('');
  }

  function renderGalleryMeta(content) {
    setText('gallery-title', content.galleryMeta.title);
    setText('gallery-subtitle', content.galleryMeta.subtitle);
  }

  function renderGallery() {
    const data = loadData(DATA_KEYS.galeria, DEFAULT_GALERIA);
    const wrapper = document.getElementById('slides-wrapper');
    const dotsContainer = document.getElementById('gallery-dots');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (!wrapper || !dotsContainer || !prevBtn || !nextBtn || !data.length) return;

    wrapper.innerHTML = data.map(function(item) {
      return [
        '<div class="gallery-slide relative flex-shrink-0 w-full h-full">',
        '<img src="' + cleanText(item.image) + '" alt="' + cleanText(item.caption) + '" class="w-full h-full object-cover" loading="lazy" onerror="this.src=\'https://via.placeholder.com/1200x600\'" />',
        '<div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end">',
        '<p class="text-white font-bold text-lg md:text-xl p-4">' + cleanText(item.caption) + '</p>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');

    dotsContainer.innerHTML = data.map(function(_, index) {
      return '<button class="gallery-dot w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ' + (index === 0 ? 'bg-purple-500' : 'bg-gray-600') + '" data-index="' + index + '"></button>';
    }).join('');

    const dots = dotsContainer.querySelectorAll('.gallery-dot');
    let currentIndex = 0;

    function updateSlider() {
      wrapper.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function(dot, index) {
        dot.classList.toggle('bg-purple-500', index === currentIndex);
        dot.classList.toggle('scale-125', index === currentIndex);
        dot.classList.toggle('bg-gray-600', index !== currentIndex);
      });
    }

    function stopAutoplay() {
      if (galleryAutoplayId) {
        clearInterval(galleryAutoplayId);
        galleryAutoplayId = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      galleryAutoplayId = setInterval(function() {
        currentIndex = (currentIndex + 1) % data.length;
        updateSlider();
      }, 5000);
    }

    prevBtn.onclick = function() {
      currentIndex = (currentIndex - 1 + data.length) % data.length;
      updateSlider();
      startAutoplay();
    };

    nextBtn.onclick = function() {
      currentIndex = (currentIndex + 1) % data.length;
      updateSlider();
      startAutoplay();
    };

    dots.forEach(function(dot) {
      dot.onclick = function() {
        currentIndex = Number(dot.dataset.index) || 0;
        updateSlider();
        startAutoplay();
      };
    });

    updateSlider();
    startAutoplay();
  }

  function renderTrailers(content) {
    setText('trailers-title', content.trailers.title);
    setText('trailers-description', content.trailers.description);

    const videosContainer = document.getElementById('trailers-videos');
    const impostorGrid = document.getElementById('impostor-images');
    if (videosContainer) {
      videosContainer.innerHTML = (content.trailers.videos || []).map(function(video) {
        return [
          '<div class="bg-gray-800/50 rounded-lg overflow-hidden">',
          '<div class="aspect-video">',
          '<iframe src="' + cleanText(video.embedUrl) + '" title="' + cleanText(video.title) + '" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
          '</div>',
          '<div class="p-4">',
          '<h4 class="font-semibold text-white">' + cleanText(video.title) + '</h4>',
          '<p class="text-gray-400 text-sm mt-1">' + cleanText(video.description) + '</p>',
          '</div>',
          '</div>'
        ].join('');
      }).join('');
    }

    setText('impostor-title', content.trailers.impostor.title);
    setText('impostor-description', content.trailers.impostor.description);
    if (impostorGrid) {
      impostorGrid.innerHTML = (content.trailers.impostor.images || []).map(function(image) {
        return '<div class="aspect-video bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"><img src="' + cleanText(image.src) + '" alt="' + cleanText(image.alt) + '" class="w-full h-full object-cover" onclick="window.open(\'' + cleanText(image.src) + '\', \'_blank\')"></div>';
      }).join('');
    }
  }

  function setupMusicModal() {
    if (musicModalInitialized) {
      return;
    }

    const modal = document.getElementById('music-modal');
    const openBtn = document.getElementById('open-music-modal');
    const closeBtn = document.getElementById('close-music-modal');
    const iframe = document.getElementById('music-iframe');
    const genreButtons = document.querySelectorAll('.genre-btn');

    if (!modal || !openBtn || !closeBtn || !iframe) {
      return;
    }

    function closeModal() {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    function openModal() {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    openBtn.onclick = openModal;
    closeBtn.onclick = closeModal;

    modal.addEventListener('click', function(event) {
      if (event.target === modal || event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });

    genreButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const videoId = cleanText(button.getAttribute('data-video'));
        if (!videoId) return;
        iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId);
      });
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    musicModalInitialized = true;
  }

  function renderRegister(content) {
    setText('register-title', content.register.title);
    setText('register-description', content.register.description);
    setLink('register-link', content.register.buttonLabel, getRegistrationUrl(content.register.buttonHref));
    setText('register-disclaimer', content.register.disclaimer);
  }

  function renderVerifier(content) {
    setText('verifier-title', content.verifier.title);
    setText('verifier-description', content.verifier.description);

    const input = document.getElementById('verifier-email');
    const button = document.getElementById('verifier-submit');
    const form = document.getElementById('verifier-form');
    const resultDiv = document.getElementById('verifier-result');
    if (!input || !button || !form || !resultDiv) return;

    input.placeholder = cleanText(content.verifier.placeholder);
    button.textContent = cleanText(content.verifier.buttonLabel);

    form.onsubmit = async function(event) {
      event.preventDefault();
      const query = normalizeVerifierValue(input.value);
      const sync = window.GamingDayRegistrationSync;
      let registrations = getVerifierRegistrations(content);
      let fetchError = null;

      if (!query) {
        resultDiv.innerHTML = '<p class="text-amber-200">Ingresa tu email, nombre o código para verificar tu registro.</p>';
        resultDiv.className = 'mt-4 p-3 rounded-lg bg-amber-500/20 border border-amber-400/50';
        resultDiv.classList.remove('hidden');
        return;
      }

      if (sync && typeof sync.getMergedRegistrationsAsync === 'function') {
        button.disabled = true;
        button.textContent = 'Verificando...';

        try {
          const state = await sync.getMergedRegistrationsAsync(content.verifier.registrations);
          registrations = state.registrations;
          fetchError = state.error;
        } finally {
          button.disabled = false;
          button.textContent = cleanText(content.verifier.buttonLabel);
        }
      }

      const found = findRegistrationMatch(registrations, query);

      if (found) {
        resultDiv.innerHTML = '<p class="text-green-300">' + cleanText(content.verifier.successPrefix) + ' ' + cleanText(found.name) + ', ' + cleanText(content.verifier.successSuffix) + '</p>';
        resultDiv.className = 'mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50';
      } else if (fetchError) {
        resultDiv.innerHTML = '<p class="text-amber-200">No pudimos confirmar tu registro ahora mismo. Intenta nuevamente en unos segundos o contacta al panel de administración.</p>';
        resultDiv.className = 'mt-4 p-3 rounded-lg bg-amber-500/20 border border-amber-400/50';
      } else {
        resultDiv.innerHTML = '<p class="text-red-300">' + cleanText(content.verifier.notFoundMessage) + ' <a href="' + getRegistrationUrl(content.register.buttonHref) + '" target="_blank" class="text-blue-300 underline">Completar registro</a>.</p>';
        resultDiv.className = 'mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50';
      }

      resultDiv.classList.remove('hidden');
    };
  }

  function renderContact(content) {
    setText('contact-title', content.contact.title);
    setText('contact-description', content.contact.description);
    setText('contact-email-label', content.contact.emailLabel);
    setLink('contact-email-link', content.contact.email, 'mailto:' + content.contact.email);
    setLink('footer-email-link', content.contact.email, 'mailto:' + content.contact.email);
    setText('contact-web-label', content.contact.webLabel);
    setLink('contact-web-link', content.contact.webText, content.contact.webHref);
  }

  function renderFooter(content) {
    setText('footer-description', content.footer.description);
    setText('footer-copyright', content.footer.copyright);
    setText('footer-organizer', content.footer.organizer);
  }

  function init() {
    const pageContent = getPageContent();
    const sync = window.GamingDayRegistrationSync;
    renderHeader(pageContent);
    renderNotification(pageContent);
    renderHero(pageContent);
    renderAbout(pageContent);
    renderGames(pageContent);
    renderUpcomingMeta(pageContent);
    renderTorneo();
    renderSchedule(pageContent);
    renderBracket(pageContent);
    renderRulesMeta(pageContent);
    renderRules();
    renderGalleryMeta(pageContent);
    renderGallery();
    renderTrailers(pageContent);
    renderRegister(pageContent);
    renderVerifier(pageContent);
    renderContact(pageContent);
    renderFooter(pageContent);
    setupMusicModal();

    if (sync && typeof sync.refreshRemoteRegistrations === 'function') {
      sync.refreshRemoteRegistrations().catch(function() {
        return null;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('storage', function(event) {
    const sync = window.GamingDayRegistrationSync;
    const refreshKeys = [
      DATA_KEYS.page,
      DATA_KEYS.torneo,
      DATA_KEYS.reglas,
      DATA_KEYS.galeria,
      sync && sync.STORAGE_KEYS ? sync.STORAGE_KEYS.registrations : 'gamingDayRegistrations'
    ];

    if (refreshKeys.indexOf(event.key) !== -1) {
      init();
    }
  });
})();
