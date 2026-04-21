(function(window) {
  'use strict';

  const REGISTRATION_PORTAL_URL = 'https://pcbsystempr-cyber.github.io/Registro-GD/';
  const LOCAL_REGISTRATION_PORTAL_URL = '../registro GD/index.html';
  const OFFICIAL_PORTAL_URL = 'https://pcbsystempr-cyber.github.io/Gaming_Day-F-D/';
  const LEGACY_REGISTRATION_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=LCmpelKgSkOat1vQrUeUdAiDyLMl18FNjjhGYwHC_Y9URVJGR1JZMkcxUzROMThUTEpGNE0yMFc4Qi4u';
  const STORAGE_KEYS = {
    registrations: 'gamingDayRegistrations',
    latestRegistration: 'gamingDayRegistration',
    page: 'pageContent'
  };

  function loadJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  }

  function normalizeEmail(value) {
    return normalizeString(value).toLowerCase();
  }

  function normalizeGames(games) {
    if (Array.isArray(games)) {
      return games.map(function(game) {
        return normalizeString(game);
      }).filter(Boolean);
    }

    if (typeof games === 'string') {
      return games.split(/[,|]/).map(function(game) {
        return normalizeString(game);
      }).filter(Boolean);
    }

    return [];
  }

  function normalizeRegistration(entry) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const normalized = {
      name: normalizeString(entry.name),
      email: normalizeEmail(entry.email),
      games: normalizeGames(entry.games),
      group: normalizeString(entry.group),
      code: normalizeString(entry.code),
      qrPayload: normalizeString(entry.qrPayload),
      qrUrl: normalizeString(entry.qrUrl),
      source: normalizeString(entry.source) || 'registro-gd',
      registeredAt: normalizeString(entry.registeredAt) || new Date().toISOString()
    };

    if (!normalized.email && !normalized.name && !normalized.code) {
      return null;
    }

    return normalized;
  }

  function registrationKey(entry) {
    if (entry.email) {
      return 'email:' + entry.email;
    }

    if (entry.code) {
      return 'code:' + entry.code.toLowerCase();
    }

    return 'name:' + entry.name.toLowerCase();
  }

  function mergeEntry(baseEntry, nextEntry) {
    return {
      name: nextEntry.name || baseEntry.name,
      email: nextEntry.email || baseEntry.email,
      games: nextEntry.games && nextEntry.games.length ? nextEntry.games : baseEntry.games,
      group: nextEntry.group || baseEntry.group,
      code: nextEntry.code || baseEntry.code,
      qrPayload: nextEntry.qrPayload || baseEntry.qrPayload,
      qrUrl: nextEntry.qrUrl || baseEntry.qrUrl,
      source: nextEntry.source || baseEntry.source,
      registeredAt: nextEntry.registeredAt || baseEntry.registeredAt
    };
  }

  function mergeRegistrations() {
    const merged = new Map();

    Array.prototype.slice.call(arguments).forEach(function(list) {
      (Array.isArray(list) ? list : []).forEach(function(entry) {
        const normalized = normalizeRegistration(entry);
        if (!normalized) {
          return;
        }

        const key = registrationKey(normalized);
        if (merged.has(key)) {
          merged.set(key, mergeEntry(merged.get(key), normalized));
          return;
        }

        merged.set(key, normalized);
      });
    });

    return Array.from(merged.values()).sort(function(a, b) {
      return String(b.registeredAt || '').localeCompare(String(a.registeredAt || ''));
    });
  }

  function getLatestStoredRegistration() {
    return normalizeRegistration(loadJson(STORAGE_KEYS.latestRegistration, null));
  }

  function getStoredRegistrations() {
    return mergeRegistrations(
      loadJson(STORAGE_KEYS.registrations, []),
      [getLatestStoredRegistration()]
    );
  }

  function saveStoredRegistrations(registrations) {
    const merged = mergeRegistrations(registrations);
    saveJson(STORAGE_KEYS.registrations, merged);
    if (merged.length) {
      saveJson(STORAGE_KEYS.latestRegistration, merged[0]);
    }
    return merged;
  }

  function getApiConfig() {
    const rawConfig = window.GAMING_DAY_REGISTRATION_API && typeof window.GAMING_DAY_REGISTRATION_API === 'object'
      ? window.GAMING_DAY_REGISTRATION_API
      : {};

    return {
      endpoint: normalizeString(rawConfig.endpoint),
      readAction: normalizeString(rawConfig.readAction) || 'listRegistrations',
      writeAction: normalizeString(rawConfig.writeAction) || 'createRegistration',
      apiKey: normalizeString(rawConfig.apiKey),
      apiKeyHeader: normalizeString(rawConfig.apiKeyHeader) || 'X-Gaming-Day-Key'
    };
  }

  function hasRemoteEndpoint() {
    return Boolean(getApiConfig().endpoint);
  }

  function getPreferredRegistrationPortalUrl() {
    const hostname = normalizeString(window.location.hostname).toLowerCase();
    const isLocalRuntime = window.location.protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1';
    return isLocalRuntime ? LOCAL_REGISTRATION_PORTAL_URL : REGISTRATION_PORTAL_URL;
  }

  function buildRequestUrl(endpoint, action) {
    const url = new URL(endpoint, window.location.href);
    if (action) {
      url.searchParams.set('action', action);
    }
    url.searchParams.set('_', Date.now().toString());
    return url.toString();
  }

  function buildRequestHeaders(config, withContentType) {
    const headers = {};
    if (withContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (config.apiKey) {
      headers[config.apiKeyHeader] = config.apiKey;
    }
    return headers;
  }

  async function parseResponsePayload(response) {
    const raw = await response.text();
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function extractRegistrations(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    if (Array.isArray(payload.registrations)) {
      return payload.registrations;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.items)) {
      return payload.items;
    }

    return [];
  }

  async function refreshRemoteRegistrations() {
    const localRegistrations = getStoredRegistrations();
    if (!hasRemoteEndpoint()) {
      return {
        registrations: localRegistrations,
        remote: false,
        source: 'local-only'
      };
    }

    const config = getApiConfig();

    try {
      const response = await window.fetch(buildRequestUrl(config.endpoint, config.readAction), {
        method: 'GET',
        headers: buildRequestHeaders(config, false),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('No se pudo consultar el registro remoto (' + response.status + ').');
      }

      const payload = await parseResponsePayload(response);
      const remoteRegistrations = mergeRegistrations(extractRegistrations(payload));
      const merged = mergeRegistrations(remoteRegistrations, localRegistrations);
      saveStoredRegistrations(merged);

      return {
        registrations: merged,
        remote: true,
        source: 'remote',
        payload: payload
      };
    } catch (error) {
      return {
        registrations: localRegistrations,
        remote: false,
        source: 'local-fallback',
        error: error
      };
    }
  }

  async function getMergedRegistrationsAsync(manualRegistrations) {
    const state = await refreshRemoteRegistrations();
    return {
      syncedRegistrations: state.registrations,
      registrations: mergeRegistrations(state.registrations, manualRegistrations),
      remote: state.remote,
      source: state.source,
      error: state.error || null
    };
  }

  function getRegistrationUrl(currentUrl) {
    const cleanUrl = normalizeString(currentUrl);
    if (
      !cleanUrl ||
      cleanUrl === LEGACY_REGISTRATION_URL ||
      cleanUrl === REGISTRATION_PORTAL_URL ||
      /forms\.office\.com\/Pages\/ResponsePage/i.test(cleanUrl)
    ) {
      return getPreferredRegistrationPortalUrl();
    }

    return cleanUrl;
  }

  function normalizePageContentRegistrationLinks() {
    const content = loadJson(STORAGE_KEYS.page, {});
    let changed = false;

    content.hero = content.hero && typeof content.hero === 'object' ? content.hero : {};
    content.register = content.register && typeof content.register === 'object' ? content.register : {};

    const heroUrl = getRegistrationUrl(content.hero.primaryButtonHref);
    const registerUrl = getRegistrationUrl(content.register.buttonHref);

    if (content.hero.primaryButtonHref !== heroUrl) {
      content.hero.primaryButtonHref = heroUrl;
      changed = true;
    }

    if (content.register.buttonHref !== registerUrl) {
      content.register.buttonHref = registerUrl;
      changed = true;
    }

    if (changed) {
      saveJson(STORAGE_KEYS.page, content);
    }

    return content;
  }

  async function recordRegistration(registration) {
    const normalized = normalizeRegistration(registration);
    if (!normalized) {
      return null;
    }

    const stored = mergeRegistrations([normalized], getStoredRegistrations());
    saveStoredRegistrations(stored);
    saveJson(STORAGE_KEYS.latestRegistration, normalized);
    normalizePageContentRegistrationLinks();

    if (!hasRemoteEndpoint()) {
      return {
        registration: normalized,
        synced: false,
        source: 'local-only',
        storedRegistrations: stored
      };
    }

    const config = getApiConfig();

    try {
      const response = await window.fetch(buildRequestUrl(config.endpoint, config.writeAction), {
        method: 'POST',
        headers: buildRequestHeaders(config, true),
        body: JSON.stringify({
          action: config.writeAction,
          registration: normalized
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo sincronizar el registro (' + response.status + ').');
      }

      const payload = await parseResponsePayload(response);
      const merged = mergeRegistrations(
        extractRegistrations(payload),
        payload && payload.registration ? [payload.registration] : [],
        stored
      );

      saveStoredRegistrations(merged);

      return {
        registration: normalized,
        synced: true,
        source: 'remote',
        storedRegistrations: merged,
        payload: payload
      };
    } catch (error) {
      return {
        registration: normalized,
        synced: false,
        source: 'local-fallback',
        storedRegistrations: stored,
        error: error
      };
    }
  }

  window.GamingDayRegistrationSync = {
    STORAGE_KEYS: STORAGE_KEYS,
    REGISTRATION_PORTAL_URL: REGISTRATION_PORTAL_URL,
    LOCAL_REGISTRATION_PORTAL_URL: LOCAL_REGISTRATION_PORTAL_URL,
    OFFICIAL_PORTAL_URL: OFFICIAL_PORTAL_URL,
    LEGACY_REGISTRATION_URL: LEGACY_REGISTRATION_URL,
    getApiConfig: getApiConfig,
    hasRemoteEndpoint: hasRemoteEndpoint,
    getRegistrationUrl: getRegistrationUrl,
    getStoredRegistrations: getStoredRegistrations,
    getMergedRegistrations: function(manualRegistrations) {
      return mergeRegistrations(getStoredRegistrations(), manualRegistrations);
    },
    getMergedRegistrationsAsync: getMergedRegistrationsAsync,
    refreshRemoteRegistrations: refreshRemoteRegistrations,
    normalizeRegistration: normalizeRegistration,
    normalizePageContentRegistrationLinks: normalizePageContentRegistrationLinks,
    recordRegistration: recordRegistration
  };
})(window);