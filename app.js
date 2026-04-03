(function () {
  const THEME_STORAGE_KEY = "threadmaker_theme";
  const COLOR_PRESET_STORAGE_KEY = "threadmaker_color_preset";
  const DEFAULT_PALETTE = "blue-ocean";
  const DEFAULT_COLOR_PRESET = "dark";
  const DRAFT_STORAGE_KEY = "threadmaker_draft";
  const INTRO_DISMISSED_STORAGE_KEY = "threadmaker_intro_dismissed";
  const SAVED_DRAFTS_STORAGE_KEY = "threadmaker_saved_drafts";
  const SAVED_HASHTAGS_STORAGE_KEY = "threadmaker_saved_hashtags";
  const UI_LANGUAGE_STORAGE_KEY = "threadmaker_ui_language";
  const TEXT_SIZE_STORAGE_KEY = "threadmaker_text_size";
  const SUPPORT_PROMPT_COUNTER_STORAGE_KEY = "threadmaker_support_prompt_counter";
  const SUPPORT_HASHTAG = "#ThreadMK";
  const MAX_TRANSLATION_SOURCE_CHARACTERS = 2500;
  const MIN_TRANSLATION_SOURCE_CHARACTERS = 150;
  const MAX_COMPRESSION_SOURCE_CHARACTERS = 2500;
  const SUPPORT_PROMPT_TRIGGER_COUNT = 10;
  const SUPPORT_PROMPT_DELAY_MS = 500;
  document.documentElement.dataset.palette = document.documentElement.dataset.palette || DEFAULT_PALETTE;
  const COLOR_PRESETS = {
    dark: { palette: "blue-ocean", theme: "dark" },
    light: { palette: "modaly", theme: "light" },
  };
  const alwaysCorrectByLanguage = {
    es: new Set(["mas"]),
    en: new Set(),
  };

  const simpleCorrectionsByLanguage = {
    es: new Map([
      ["qeu", "que"],
      ["aun", "aún"],
      ["mas", "más"],
      ["solo", "sólo"],
      ["tmb", "también"],
      ["tambien", "también"],
      ["donde", "dónde"],
      ["como", "cómo"],
      ["por que", "porque"],
      ["porqué", "por qué"],
      ["haber", "a ver"],
      ["k", "que"],
      ["xq", "porque"],
      ["xq?", "¿por qué?"],
    ]),
    en: new Map([
      ["teh", "the"],
      ["dont", "don't"],
      ["cant", "can't"],
      ["wont", "won't"],
      ["im", "I'm"],
      ["ive", "I've"],
      ["id", "I'd"],
      ["i'm", "I'm"],
    ]),
  };

  const languageLabels = {
    en: {
      en: "English",
      es: "Spanish",
    },
    es: {
      en: "ingles",
      es: "espanol",
    },
  };

  const uiStrings = {
    en: {
      threadPrefix: "[Thread]",
      documentTitle: "Free editor and thread splitter for X (Twitter) and Bluesky",
      metaDescription:
        "Write posts, save ideas and split long text into clean posts in your browser. Preserve line breaks, add hashtags, number posts, and spellcheck before you publish.",
      pageEyebrow: "Free, no account needed",
      pageHeading: "Free editor and thread splitter for X (Twitter) and Bluesky",
      pageDescription:
        "Write posts, save ideas and split long text into clean posts in your browser. Preserve line breaks, add hashtags, number posts, and spellcheck before you publish.",
      charactersPerPost: "Characters per post",
      customCharacterLimit: "Custom character limit",
      longForm: "Long-form",
      preserveLineBreaks: "Preserve line breaks",
      preserveLineBreaksTooltip:
        "Keeps your line and paragraph breaks when splitting text into posts.",
      language: "Language",
      numberPosts: "Number posts",
      numberPostsTooltip: "Adds numbering like 1/3, 2/3 and 3/3 to generated posts.",
      supportThreadMk: "Support #ThreadMK",
      supportThreadMkPrefix: "Support",
      supportThreadMkTooltip:
        "Adds #ThreadMK to the end of the hashtag list on generated posts.",
      compressionStrength: "Compression",
      compressionStrengthTooltip:
        "AI function that shortens your text while keeping the main idea. Soft makes light changes, Medium rewrites a bit more, and Heavy edits more aggressively.",
      compressSoft: "Soft",
      compressMedium: "Medium",
      compressHeavy: "Heavy",
      supportThreadMkMessage:
        "Support ThreadMK sharing this hashtag. You can disable it from Settings.",
      supportPromptTitle: "Give if you're able",
      supportPromptMessage:
        "Help keep ThreadMK free and awesome. Your support helps cover AI and hosting costs. If it saves you time, consider backing it.",
      supportPromptEnableTitle: "Enable #ThreadMK",
      supportPromptKofi: "ko-fi.com/blizky",
      supportPromptPaypal: "paypal.me/blizky",
      ok: "OK",
      theme: "Theme",
      paletteDark: "Dark",
      paletteLight: "Light",
      largerText: "Larger text",
      spellcheck: "Spellcheck",
      compress: "Compress",
      compressing: "Compressing...",
      compressedBy: "Shortened by {count} chars.",
      clearCache: "Clear cache",
      clearCacheWarning:
        "This will clear ThreadMK saved data and browser storage, including saved ideas and hashtags. Continue?",
      supportTitle: "Give if you're able",
      signoff: "Made by Alex with",
      clearText: "Clear text",
      enterTextHere: "Enter text here...",
      charCount: "{count} chars",
      paste: "Paste",
      pasting: "Pasting...",
      pasted: "Pasted",
      clipboardEmpty: "Clipboard is empty.",
      save: "Save",
      load: "Load",
      newDraft: "New",
      saveDraft: "Save idea",
      savedDraft: "Saved",
      loadDraft: "Load idea",
      hideIntro: "Hide intro",
      noSavedDrafts: "No saved drafts.",
      deleteSavedDraft: "Delete saved draft",
      untitledDraft: "Untitled draft",
      enterHashtagsHere: "Enter hashtags here...",
      noSavedHashtags: "No saved hashtags.",
      deleteSavedHashtag: "Delete saved hashtag",
      postLabel: "Post {index} of {total}",
      copy: "Copy",
      copied: "Copied",
      copyPost: "Copy post",
      copyFailed: "Copy failed in this browser. Try selecting the text manually.",
      translateToLanguage: "Translate to {language}",
      translatingToLanguage: "Translating to {language}...",
      translationFailed: "Translation failed. Please try again.",
      translationLimitReached:
        "Translation currently supports up to {count} characters in the source text.",
      compressionLimitReached:
        "Compression currently supports up to {count} characters in the source text.",
      spellcheckMismatchGeneric:
        "It seems that this text is not {language}. Currently spellchecking only works for English and Spanish.",
      spellcheckSwitchSpanish:
        "It seems that this text is not English. Currently spellchecking only works for English and Spanish.\n\nDo you want to check in Spanish?",
      spellcheckPromptTitle: "Spellcheck Language",
      cancel: "Cancel",
      continue: "Continue",
      yes: "Yes",
      correctAction: "Spellcheck",
      correctingText: "Spellchecking...",
      noChangesNeeded: "No changes needed.",
      correctedIssue_one: "Corrected {count} issue",
      correctedIssue_other: "Corrected {count} issues",
      flaggedTerm_one: "flagged {count} suspicious term",
      flaggedTerm_other: "flagged {count} suspicious terms",
      viaLanguageTool: "{parts} via LanguageTool",
      fallbackFix_one: "Applied {count} fallback fix",
      fallbackFix_other: "Applied {count} fallback fixes",
      correctionFailed: "Correction failed",
      compressionFailed: "Compression failed. Please try again.",
      compressionNoChanges: "No shorter version found.",
      clearingCache: "Clearing cache...",
      cacheClearFailed: "Cache clear failed.",
      invalidCharacterLimit: "Please choose a valid character limit.",
      hashtagsFullLimit: "The hashtags alone use the full last-post limit.",
      hashtagsNumberingNoRoom: "The hashtags and numbering leave no room for the last post.",
      splitTextFailed: "Could not split this text cleanly. Try a slightly higher limit.",
    },
    es: {
      threadPrefix: "[Hilo]",
      documentTitle: "Editor y creador gratuito de hilos para X (Twitter) y Bluesky",
      metaDescription:
        "Escribe publicaciones, guarda ideas y divide texto largo en publicaciones limpias desde tu navegador. Preserva saltos de linea, agrega hashtags, numera publicaciones y revisa ortografia antes de publicar.",
      pageEyebrow: "Gratis y sin cuenta",
      pageHeading: "Editor y creador gratuito de hilos para X (Twitter) y Bluesky",
      pageDescription:
        "Escribe publicaciones, guarda ideas y divide texto largo en publicaciones limpias desde tu navegador. Preserva saltos de linea, agrega hashtags, numera publicaciones y revisa ortografia antes de publicar.",
      charactersPerPost: "Caracteres por publicacion",
      customCharacterLimit: "Limite personalizado de caracteres",
      longForm: "Texto largo",
      preserveLineBreaks: "Preservar saltos de linea",
      preserveLineBreaksTooltip:
        "Mantiene tus saltos de linea y parrafos al dividir el texto en publicaciones.",
      language: "Idioma",
      numberPosts: "Numerar publicaciones",
      numberPostsTooltip:
        "Agrega numeracion como 1/3, 2/3 y 3/3 a las publicaciones generadas.",
      supportThreadMk: "Apoyar #ThreadMK",
      supportThreadMkPrefix: "Apoyar",
      supportThreadMkTooltip:
        "Agrega #ThreadMK al final de la lista de hashtags en las publicaciones generadas.",
      compressionStrength: "Compresion",
      compressionStrengthTooltip:
        "Funcion de IA que acorta tu texto manteniendo la idea principal. Suave hace cambios leves, Medio reescribe un poco mas y Fuerte edita con mas agresividad.",
      compressSoft: "Suave",
      compressMedium: "Media",
      compressHeavy: "Fuerte",
      supportThreadMkMessage:
        "Apoya a ThreadMK compartiendo este hashtag. Puedes desactivarlo desde Ajustes.",
      supportPromptTitle: "Apoya si puedes",
      supportPromptMessage:
        "Ayuda a mantener ThreadMK gratis y genial. Tu apoyo ayuda a cubrir los costos de IA y alojamiento. Si te ahorra tiempo, considera apoyarlo.",
      supportPromptEnableTitle: "Activar #ThreadMK",
      supportPromptKofi: "ko-fi.com/blizky",
      supportPromptPaypal: "paypal.me/blizky",
      ok: "OK",
      theme: "Tema",
      paletteDark: "Oscuro",
      paletteLight: "Claro",
      largerText: "Texto mas grande",
      spellcheck: "Revisar ortografia",
      compress: "Comprimir",
      compressing: "Comprimiendo...",
      compressedBy: "Acortado por {count} caracteres.",
      clearCache: "Borrar cache",
      clearCacheWarning:
        "Esto borrara los datos guardados de ThreadMK y el almacenamiento del navegador, incluidas las ideas y los hashtags guardados. Continuar?",
      supportTitle: "Apoya si puedes",
      signoff: "Hecho por Alex con",
      clearText: "Borrar texto",
      enterTextHere: "Escribe el texto aqui...",
      charCount: "{count} caracteres",
      paste: "Pegar",
      pasting: "Pegando...",
      pasted: "Pegado",
      clipboardEmpty: "El portapapeles esta vacio.",
      save: "Guardar",
      load: "Cargar",
      newDraft: "Nuevo",
      saveDraft: "Guardar idea",
      savedDraft: "Guardada",
      loadDraft: "Cargar idea",
      hideIntro: "Ocultar introduccion",
      noSavedDrafts: "No hay borradores guardados.",
      deleteSavedDraft: "Eliminar borrador guardado",
      untitledDraft: "Borrador sin titulo",
      enterHashtagsHere: "Escribe hashtags aqui...",
      noSavedHashtags: "No hay hashtags guardados.",
      deleteSavedHashtag: "Eliminar hashtag guardado",
      postLabel: "Publicacion {index} de {total}",
      copy: "Copiar",
      copied: "Copiado",
      copyPost: "Copiar publicacion",
      copyFailed: "La copia fallo en este navegador. Intenta seleccionar el texto manualmente.",
      translateToLanguage: "Traducir a {language}",
      translatingToLanguage: "Traduciendo a {language}...",
      translationFailed: "La traduccion fallo. Intenta de nuevo.",
      translationLimitReached:
        "La traduccion actualmente admite hasta {count} caracteres en el texto de origen.",
      compressionLimitReached:
        "La compresion actualmente admite hasta {count} caracteres en el texto de origen.",
      spellcheckMismatchGeneric:
        "Parece que este texto no esta en {language}. Actualmente la revision ortografica solo funciona para ingles y espanol.",
      spellcheckSwitchSpanish:
        "Parece que este texto no esta en ingles. Actualmente la revision ortografica solo funciona para ingles y espanol.\n\nQuieres revisar en espanol?",
      spellcheckPromptTitle: "Idioma de revision",
      cancel: "Cancelar",
      continue: "Continuar",
      yes: "Si",
      correctAction: "Revisar ortografia",
      correctingText: "Revisando ortografia...",
      noChangesNeeded: "No se necesitan cambios.",
      correctedIssue_one: "Corregido {count} problema",
      correctedIssue_other: "Corregidos {count} problemas",
      flaggedTerm_one: "marcado {count} termino sospechoso",
      flaggedTerm_other: "marcados {count} terminos sospechosos",
      viaLanguageTool: "{parts} con LanguageTool",
      fallbackFix_one: "Aplicada {count} correccion alternativa",
      fallbackFix_other: "Aplicadas {count} correcciones alternativas",
      correctionFailed: "La correccion fallo",
      compressionFailed: "La compresion fallo. Intenta de nuevo.",
      compressionNoChanges: "No se encontro una version mas corta.",
      clearingCache: "Borrando cache...",
      cacheClearFailed: "No se pudo borrar la cache.",
      invalidCharacterLimit: "Elige un limite de caracteres valido.",
      hashtagsFullLimit: "Los hashtags por si solos usan todo el limite del ultimo post.",
      hashtagsNumberingNoRoom: "Los hashtags y la numeracion no dejan espacio para el ultimo post.",
      splitTextFailed: "No se pudo dividir este texto limpiamente. Prueba con un limite un poco mayor.",
    },
  };

  const ignoredCorrections = new Set();

  let selectedLanguage = "en";
  let interfaceLanguage = "en";

  function uiText(key, replacements = {}, locale = interfaceLanguage) {
    const safeLocale = locale === "es" ? "es" : "en";
    const template = uiStrings[safeLocale][key] || uiStrings.en[key] || key;

    return template.replace(/\{(\w+)\}/g, (_, token) => {
      if (Object.prototype.hasOwnProperty.call(replacements, token)) {
        return String(replacements[token]);
      }

      return `{${token}}`;
    });
  }

  function getLanguageLabel(language, options = {}) {
    const safeLocale = options.locale === "es" ? "es" : options.locale === "en" ? "en" : interfaceLanguage;
    const safeLanguage = language === "es" ? "es" : "en";
    let label = languageLabels[safeLocale][safeLanguage];

    if (options.capitalize && label) {
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    return label;
  }

  function pluralText(key, count, locale = interfaceLanguage) {
    return uiText(`${key}_${count === 1 ? "one" : "other"}`, { count }, locale);
  }

  function getOppositeLanguage(language = interfaceLanguage) {
    return language === "es" ? "en" : "es";
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
  }

  function getThreadPrefix(language = selectedLanguage) {
    const safeLanguage = language === "es" ? "es" : "en";
    return `${uiText("threadPrefix", {}, safeLanguage)} `;
  }

  function prependThreadPrefix(text, language = selectedLanguage) {
    const normalized = normalizeText(text || "");

    if (!normalized) {
      return "";
    }

    if (/^\[(?:thread|hilo)\]\s*/i.test(normalized)) {
      return normalized;
    }

    return `${getThreadPrefix(language)}${normalized}`;
  }

  function normalizeWord(word) {
    return String(word || "").trim().toLowerCase();
  }

  function getIgnoredCorrectionKey(word, language = selectedLanguage) {
    return `${language === "es" ? "es" : "en"}:${normalizeWord(word)}`;
  }

  function isIgnoredCorrection(word, language = selectedLanguage) {
    return ignoredCorrections.has(getIgnoredCorrectionKey(word, language));
  }

  function addIgnoredCorrection(word, language = selectedLanguage) {
    const key = getIgnoredCorrectionKey(word, language);
    if (!key.endsWith(":")) {
      ignoredCorrections.add(key);
    }
  }

  function removeIgnoredCorrection(word, language = selectedLanguage) {
    ignoredCorrections.delete(getIgnoredCorrectionKey(word, language));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderPostHtml(text, options = {}) {
    const content = String(text || "");
    const muteHashtags = Boolean(options.muteHashtags);
    let html = "";
    let lastIndex = 0;
    const hashtagPattern = /#[\p{L}\p{N}_]+/gu;
    let match = hashtagPattern.exec(content);

    while (match) {
      const hashtag = match[0];
      const start = match.index;
      const isSupportHashtag = normalizeHashtagToken(hashtag) === SUPPORT_HASHTAG;
      html += escapeHtml(content.slice(lastIndex, start));
      html += isSupportHashtag
        ? `<span class="post-hashtag-support-wrap"><span class="post-hashtag post-hashtag-support" tabindex="0">${escapeHtml(hashtag)}</span><span class="post-hashtag-tooltip" role="tooltip">${escapeHtml(uiText("supportThreadMkMessage"))}</span></span>`
        : `<span class="post-hashtag${muteHashtags ? " post-hashtag-muted" : ""}">${escapeHtml(hashtag)}</span>`;
      lastIndex = start + hashtag.length;
      match = hashtagPattern.exec(content);
    }

    html += escapeHtml(content.slice(lastIndex));
    return html;
  }

  function wrapSegment(segmentText, segmentStart, ranges) {
    if (!segmentText) {
      return "";
    }

    let html = "";
    let index = 0;
    const segmentEnd = segmentStart + segmentText.length;

    ranges.forEach((range) => {
      const start = Math.max(range.start, segmentStart);
      const end = Math.min(range.end, segmentEnd);
      if (end <= start) {
        return;
      }

      const relativeStart = start - segmentStart;
      const relativeEnd = end - segmentStart;
      html += escapeHtml(segmentText.slice(index, relativeStart));
      html += `<span class="flag">${escapeHtml(segmentText.slice(relativeStart, relativeEnd))}</span>`;
      index = relativeEnd;
    });

    html += escapeHtml(segmentText.slice(index));
    return html;
  }

  function buildOutputHtml(original, edits, ignoredRanges = []) {
    const ranges = [...ignoredRanges].sort((a, b) => a.start - b.start);
    const orderedEdits = [...edits].sort((a, b) => a.offset - b.offset);
    let cursor = 0;
    let html = "";

    orderedEdits.forEach((edit) => {
      const before = original.slice(cursor, edit.offset);
      html += wrapSegment(before, cursor, ranges);
      const originalEncoded = encodeURIComponent(edit.original || "");
      const correctedEncoded = encodeURIComponent(edit.replacement || "");
      html += `<span class="change" data-original="${originalEncoded}" data-corrected="${correctedEncoded}">${escapeHtml(edit.replacement)}</span>`;
      cursor = edit.offset + edit.length;
    });

    html += wrapSegment(original.slice(cursor), cursor, ranges);
    return html;
  }

  function formatHashtagWord(word) {
    if (!word) {
      return "";
    }

    if (word.length <= 2 && word === word.toUpperCase()) {
      return word;
    }

    const tail = word === word.toLowerCase() ? word.slice(1).toLowerCase() : word.slice(1);
    return word.charAt(0).toUpperCase() + tail;
  }

  function normalizeHashtagToken(tag) {
    const stripped = String(tag || "").replace(/^#+/, "").trim();
    if (!stripped) {
      return "";
    }

    const words = stripped
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
      .filter(Boolean);

    if (!words.length) {
      return "";
    }

    return `#${words.map(formatHashtagWord).join("")}`;
  }

  function normalizeHashtags(input) {
    return input
      .split(/[\s,]+/)
      .map(normalizeHashtagToken)
      .filter(Boolean)
      .join(" ");
  }

  function buildHashtagsValue(input, options = {}) {
    const tokens = normalizeHashtags(input || "")
      .split(/\s+/)
      .filter(Boolean);

    if (options.includeSupportTag && !tokens.includes(SUPPORT_HASHTAG)) {
      tokens.push(SUPPORT_HASHTAG);
    }

    return tokens.join(" ");
  }

  function normalizeCompressionStrength(value) {
    return value === "medium" || value === "heavy" ? value : "soft";
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function preserveMarkdownMarkers(original, replacement) {
    if (!original || !replacement) {
      return replacement;
    }

    const leadingMatch = original.match(/^([*_~`]+)(?=\S)/);
    const trailingMatch = original.match(/([*_~`]+)$/);
    let next = replacement;

    if (leadingMatch && !next.startsWith(leadingMatch[1])) {
      next = `${leadingMatch[1]}${next}`;
    }

    if (trailingMatch && !next.endsWith(trailingMatch[1])) {
      next = `${next}${trailingMatch[1]}`;
    }

    return next;
  }

  function editsOverlap(a, b) {
    const aStart = a.offset;
    const aEnd = a.offset + a.length;
    const bStart = b.offset;
    const bEnd = b.offset + b.length;

    if (a.length === 0 && b.length === 0) {
      return aStart === bStart;
    }

    if (a.length === 0) {
      return aStart >= bStart && aStart < bEnd;
    }

    if (b.length === 0) {
      return bStart >= aStart && bStart < aEnd;
    }

    return aStart < bEnd && bStart < aEnd;
  }

  function mergeEdits(primary, additional) {
    const combined = [...primary];

    additional.forEach((edit) => {
      const hasOverlap = combined.some((existing) => editsOverlap(existing, edit));
      if (!hasOverlap) {
        combined.push(edit);
      }
    });

    return combined;
  }

  function applyEdits(text, edits) {
    let corrected = text;

    [...edits]
      .sort((a, b) => b.offset - a.offset)
      .forEach((edit) => {
        corrected =
          corrected.slice(0, edit.offset) +
          edit.replacement +
          corrected.slice(edit.offset + edit.length);
      });

    return corrected;
  }

  function applySimpleCorrections(text, language = selectedLanguage) {
    const simpleCorrections =
      simpleCorrectionsByLanguage[language] || simpleCorrectionsByLanguage.en;
    const alwaysCorrect = alwaysCorrectByLanguage[language] || alwaysCorrectByLanguage.en;
    const edits = [];

    simpleCorrections.forEach((value, key) => {
      const regex = new RegExp(`\\b${escapeRegExp(key)}\\b`, "gi");
      let match;

      while ((match = regex.exec(text)) !== null) {
        const original = match[0];
        const originalKey = normalizeWord(original);
        const nextValue = original === original.toUpperCase() ? value.toUpperCase() : value;
        const replacement = preserveMarkdownMarkers(original, nextValue);

        if (original !== replacement && (!isIgnoredCorrection(original, language) || alwaysCorrect.has(originalKey))) {
          edits.push({
            offset: match.index,
            length: original.length,
            replacement,
            original,
          });
        }
      }
    });

    return {
      corrected: applyEdits(text, edits),
      edits,
    };
  }

  function shouldIgnoreCorrection(text, match, language = "en") {
    const original = text.slice(match.offset, match.offset + match.length);
    const replacement = match.replacements?.[0]?.value || "";
    const prevChar = match.offset > 0 ? text[match.offset - 1] : "";
    const atSentenceStart = match.offset === 0 || /[.!?\n\r]/.test(prevChar);
    const startsWithUpper = /^[A-ZÁÉÍÓÚÑ]/.test(original);
    const originalAllCaps = /^[A-ZÁÉÍÓÚÑ]+$/.test(original);
    const replacementAllCaps = /^[A-ZÁÉÍÓÚÑ]+$/.test(replacement);
    const originalAsciiWord = /^[A-Za-z]+$/.test(original);
    const replacementHasNonAscii = /[^\x00-\x7F]/.test(replacement);

    if (startsWithUpper && !atSentenceStart) {
      return true;
    }

    if (replacementAllCaps && !originalAllCaps) {
      return true;
    }

    if (language !== "es" && originalAsciiWord && replacementHasNonAscii) {
      return true;
    }

    if (isIgnoredCorrection(original)) {
      return true;
    }

    return false;
  }

  function applyLanguageToolFixes(text, matches, language = "en") {
    const ignoredRanges = [];
    const edits = matches
      .filter((match) => match.replacements && match.replacements.length)
      .filter((match) => {
        if (shouldIgnoreCorrection(text, match, language)) {
          ignoredRanges.push({
            start: match.offset,
            end: match.offset + match.length,
          });
          return false;
        }

        return true;
      })
      .map((match) => ({
        offset: match.offset,
        length: match.length,
        replacement: preserveMarkdownMarkers(
          text.slice(match.offset, match.offset + match.length),
          match.replacements[0].value
        ),
        original: text.slice(match.offset, match.offset + match.length),
      }));

    return { ignoredRanges, edits };
  }

  function findForcedEdits(text, language = selectedLanguage) {
    if (language !== "es") {
      return [];
    }

    const edits = [];
    const regex = /\bmas\b/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      const replacement = original === original.toUpperCase() ? "MÁS" : "más";

      edits.push({
        offset: match.index,
        length: original.length,
        replacement,
        original,
      });
    }

    return edits;
  }

  function detectSuggestedLanguage(text) {
    const sample = String(text || "").toLowerCase();
    if (!sample.trim()) {
      return { language: null, confidence: 0 };
    }

    const accentHits = (sample.match(/[áéíóúñü¿¡]/g) || []).length;
    const tokens = sample.match(/[a-záéíóúñü']+/g) || [];
    let esScore = accentHits * 3;
    let enScore = 0;

    const commonEs = new Set([
      "de",
      "la",
      "que",
      "el",
      "en",
      "por",
      "para",
      "con",
      "una",
      "del",
      "los",
      "las",
      "un",
      "se",
      "al",
    ]);
    const commonEn = new Set([
      "the",
      "and",
      "is",
      "of",
      "to",
      "for",
      "with",
      "that",
      "this",
      "from",
      "as",
      "by",
      "in",
      "on",
      "at",
    ]);

    for (const token of tokens) {
      if (commonEs.has(token)) {
        esScore += 1;
      }

      if (commonEn.has(token)) {
        enScore += 1;
      }
    }

    const total = esScore + enScore;
    if (!total) {
      return { language: null, confidence: 0 };
    }

    return {
      language: esScore >= enScore ? "es" : "en",
      confidence: Math.abs(esScore - enScore) / total,
    };
  }

  function normalizePlainPaste(text) {
    if (!text) {
      return "";
    }

    return String(text)
      .replace(/^\uFEFF/, "")
      .replace(/\u00a0/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n\n")
      .map((block) => block.replace(/\n+/g, " ").replace(/[ \t]{2,}/g, " ").trim())
      .filter(Boolean)
      .join("\n\n");
  }

  function htmlToRenderedParagraphText(html) {
    if (!html) {
      return "";
    }

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const blockTags = new Set([
        "p",
        "div",
        "article",
        "section",
        "main",
        "aside",
        "header",
        "footer",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "li",
        "ul",
        "ol",
        "blockquote",
        "pre",
        "table",
        "tr",
      ]);

      function walk(node) {
        if (!node) {
          return "";
        }

        if (node.nodeType === Node.TEXT_NODE) {
          return (node.textContent || "").replace(/\s+/g, " ");
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          return "";
        }

        const tag = node.tagName.toLowerCase();
        if (tag === "br") {
          return "\n";
        }

        let chunk = "";
        node.childNodes.forEach((child) => {
          chunk += walk(child);
        });

        if (blockTags.has(tag)) {
          const trimmed = chunk.trim();
          return trimmed ? `${trimmed}\n\n` : "";
        }

        return chunk;
      }

      const rendered = walk(doc.body) || doc.body?.innerText || doc.body?.textContent || "";
      return normalizePlainPaste(rendered);
    } catch (error) {
      return "";
    }
  }

  async function correctTextContent(text, language = selectedLanguage, fetchImpl = globalThis.fetch) {
    const original = String(text || "");
    if (!original.trim()) {
      return {
        corrected: "",
        changes: 0,
        method: "none",
        edits: [],
        ignoredRanges: [],
        original,
      };
    }

    let edits = [];
    let ignoredRanges = [];
    let method = "fallback";
    const activeLanguage = language === "es" ? "es" : "en";
    const apiLanguage = activeLanguage === "es" ? "es" : "en-US";

    try {
      if (typeof fetchImpl !== "function") {
        throw new Error("Fetch unavailable");
      }

      const response = await fetchImpl("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text: original,
          language: apiLanguage,
          enabledOnly: "false",
        }),
      });

      if (!response.ok) {
        throw new Error("LanguageTool unavailable");
      }

      const data = await response.json();
      const result = applyLanguageToolFixes(original, data.matches || [], activeLanguage);
      edits = result.edits;
      ignoredRanges = result.ignoredRanges;
      method = "languagetool";
    } catch (error) {
      const fallback = applySimpleCorrections(original, activeLanguage);
      edits = fallback.edits;
      ignoredRanges = [];
      method = "fallback";
    }

    const forcedEdits = findForcedEdits(original, activeLanguage);
    const combinedEdits = mergeEdits(edits, forcedEdits);

    return {
      corrected: applyEdits(original, combinedEdits),
      changes: combinedEdits.length,
      method,
      edits: combinedEdits,
      ignoredRanges,
      original,
    };
  }

  async function compressTextContent(
    text,
    options = {},
    fetchImpl = globalThis.fetch,
  ) {
    const sourceText = normalizeText(text || "");
    if (!sourceText) {
      return {
        compressedText: "",
        compressionStrength: normalizeCompressionStrength(options.compressionStrength),
        sourceLanguage: options.sourceLanguage === "es" ? "es" : "en",
      };
    }

    if (typeof fetchImpl !== "function") {
      throw new Error(uiText("compressionFailed"));
    }

    const response = await fetchImpl("/api/compress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceText,
        sourceLanguage: options.sourceLanguage === "es" ? "es" : "en",
        compressionStrength: normalizeCompressionStrength(options.compressionStrength),
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || uiText("compressionFailed"));
    }

    const compressedText =
      typeof payload?.compressedText === "string" ? normalizeText(payload.compressedText) : "";

    if (!compressedText) {
      throw new Error(uiText("compressionFailed"));
    }

    return {
      compressedText,
      compressionStrength: normalizeCompressionStrength(payload?.compressionStrength),
      sourceLanguage: payload?.sourceLanguage === "es" ? "es" : "en",
    };
  }

  function findBestBreakIndex(text, maxLength) {
    if (text.length <= maxLength) {
      return text.length;
    }

    const slice = text.slice(0, maxLength + 1);
    const breakPatterns = [
      /\n{2,}(?![\s\S]*\n{2,})/,
      /[.!?…]["')\]]?\s+(?![\s\S]*[.!?…]["')\]]?\s+)/,
      /\n(?![\s\S]*\n)/,
      /\s(?![\s\S]*\s)/,
    ];

    for (const pattern of breakPatterns) {
      const match = slice.match(pattern);
      if (match && typeof match.index === "number") {
        if (pattern.source.startsWith("\\n{2,")) {
          return match.index;
        }

        return match.index + match[0].length;
      }
    }

    return maxLength;
  }

  function takeChunk(text, maxLength) {
    const safeLength = Math.max(1, maxLength);

    if (text.length <= safeLength) {
      return {
        chunk: text.trim(),
        rest: "",
      };
    }

    const breakIndex = findBestBreakIndex(text, safeLength);
    let chunk = text.slice(0, breakIndex).trim();
    let rest = text.slice(breakIndex).trimStart();

    if (!chunk) {
      chunk = text.slice(0, safeLength).trim();
      rest = text.slice(safeLength).trimStart();
    }

    return { chunk, rest };
  }

  function splitPlainPosts(text, getLimitForIndex) {
    let remaining = normalizeText(text);
    const chunks = [];
    let index = 0;

    while (remaining) {
      const available = getLimitForIndex(index);

      if (!Number.isFinite(available) || available < 1) {
        throw new Error("The selected limit is too small for the current settings.");
      }

      const { chunk, rest } = takeChunk(remaining, available);

      if (!chunk) {
        break;
      }

      chunks.push(chunk);
      remaining = rest;
      index += 1;
    }

    return chunks;
  }

  function tokenizeText(text) {
    const paragraphs = normalizeText(text)
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const units = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const sentences =
        paragraph.match(/[^.!?…]+(?:[.!?…]+["')\]]*)?|[^.!?…]+$/g) || [paragraph];

      sentences
        .map((sentence) => sentence.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .forEach((sentence, sentenceIndex) => {
          units.push({
            text: sentence,
            separatorBefore:
              sentenceIndex === 0 ? (paragraphIndex === 0 ? "" : "\n\n") : " ",
          });
        });
    });

    return units;
  }

  function tokenizeWords(text) {
    const paragraphs = normalizeText(text)
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const units = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {
      paragraph
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word, wordIndex) => {
          units.push({
            text: word,
            separatorBefore:
              wordIndex === 0 ? (paragraphIndex === 0 ? "" : "\n\n") : " ",
          });
        });
    });

    return units;
  }

  function splitLongTextByWords(text, maxLength) {
    const safeLength = Math.max(1, maxLength);
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    const chunks = [];
    let current = "";

    function pushHardSlices(word) {
      for (let index = 0; index < word.length; index += safeLength) {
        chunks.push(word.slice(index, index + safeLength));
      }
    }

    words.forEach((word) => {
      if (!current) {
        if (word.length <= safeLength) {
          current = word;
        } else {
          pushHardSlices(word);
        }
        return;
      }

      const next = `${current} ${word}`;
      if (next.length <= safeLength) {
        current = next;
        return;
      }

      chunks.push(current);

      if (word.length <= safeLength) {
        current = word;
      } else {
        current = "";
        pushHardSlices(word);
      }
    });

    if (current) {
      chunks.push(current);
    }

    return chunks.length ? chunks : [String(text || "").slice(0, safeLength)];
  }

  function expandUnitsForLimit(units, minCapacity) {
    const safeCapacity = Math.max(1, minCapacity);

    return units.flatMap((unit) => {
      if (unit.text.length <= safeCapacity) {
        return [unit];
      }

      return splitLongTextByWords(unit.text, safeCapacity).map((piece, index) => ({
        text: piece,
        separatorBefore: index === 0 ? unit.separatorBefore : " ",
      }));
    });
  }

  function buildPostFromUnits(units, start, end) {
    let text = "";

    for (let index = start; index <= end; index += 1) {
      text += `${index === start ? "" : units[index].separatorBefore}${units[index].text}`;
    }

    return text;
  }

  function createLengthHelpers(units) {
    const textPrefix = [0];
    const separatorPrefix = [0];

    units.forEach((unit) => {
      textPrefix.push(textPrefix[textPrefix.length - 1] + unit.text.length);
      separatorPrefix.push(
        separatorPrefix[separatorPrefix.length - 1] + unit.separatorBefore.length
      );
    });

    function getRangeLength(start, end) {
      const textLength = textPrefix[end + 1] - textPrefix[start];
      const separatorLength = separatorPrefix[end + 1] - separatorPrefix[start + 1];
      return textLength + separatorLength;
    }

    return { getRangeLength };
  }

  function chooseBetterPlan(currentBest, candidate) {
    if (!currentBest) {
      return candidate;
    }

    const epsilon = 1e-9;

    if (candidate.minFill > currentBest.minFill + epsilon) {
      return candidate;
    }

    if (candidate.minFill < currentBest.minFill - epsilon) {
      return currentBest;
    }

    if (candidate.maxWaste < currentBest.maxWaste - epsilon) {
      return candidate;
    }

    if (candidate.maxWaste > currentBest.maxWaste + epsilon) {
      return currentBest;
    }

    if (candidate.totalWaste < currentBest.totalWaste - epsilon) {
      return candidate;
    }

    if (candidate.totalWaste > currentBest.totalWaste + epsilon) {
      return currentBest;
    }

    if (candidate.posts[0].length > currentBest.posts[0].length) {
      return candidate;
    }

    return currentBest;
  }

  function segmentUnits(units, capacities) {
    if (!units.length) {
      return [];
    }

    const { getRangeLength } = createLengthHelpers(units);
    const memo = new Map();

    function solve(start, postIndex) {
      const key = `${start}:${postIndex}`;
      if (memo.has(key)) {
        return memo.get(key);
      }

      const remainingPosts = capacities.length - postIndex;
      const remainingUnits = units.length - start;

      if (remainingUnits < remainingPosts || remainingPosts <= 0) {
        memo.set(key, null);
        return null;
      }

      const capacity = capacities[postIndex];
      const lastEnd =
        postIndex === capacities.length - 1
          ? units.length - 1
          : units.length - remainingPosts;

      let best = null;

      for (let end = start; end <= lastEnd; end += 1) {
        const length = getRangeLength(start, end);

        if (length > capacity) {
          break;
        }

        const currentPost = buildPostFromUnits(units, start, end);
        const currentWaste = capacity - length;
        const currentFill = length / capacity;

        if (postIndex === capacities.length - 1) {
          if (end !== units.length - 1) {
            continue;
          }

          best = chooseBetterPlan(best, {
            posts: [currentPost],
            minFill: currentFill,
            maxWaste: currentWaste,
            totalWaste: currentWaste,
          });
          continue;
        }

        const remainder = solve(end + 1, postIndex + 1);
        if (!remainder) {
          continue;
        }

        best = chooseBetterPlan(best, {
          posts: [currentPost, ...remainder.posts],
          minFill: Math.min(currentFill, remainder.minFill),
          maxWaste: Math.max(currentWaste, remainder.maxWaste),
          totalWaste: currentWaste + remainder.totalWaste,
        });
      }

      memo.set(key, best);
      return best;
    }

    return solve(0, 0)?.posts || null;
  }

  function estimatePostCount(text, limit, hashtagsBlock, numbering, options = {}) {
    const continuationMarker = options.continuationMarker || "";
    let estimate = 1;

    for (let iteration = 0; iteration < 12; iteration += 1) {
      const plainPosts = splitPlainPosts(text, (index) => {
        const suffix = numbering ? ` (${index + 1}/${estimate})` : "";
        const continuationReserve = index < estimate - 1 ? continuationMarker.length : 0;
        const reserved =
          suffix.length +
          continuationReserve +
          (index === estimate - 1 ? hashtagsBlock.length : 0);
        return limit - reserved;
      });

      if (plainPosts.length === estimate) {
        return plainPosts.length;
      }

      estimate = plainPosts.length;
    }

    return estimate;
  }

  function buildGreedyPosts(text, options) {
    const limit = Number(options.limit);
    const numbering = Boolean(options.numbering);
    const hashtagsBlock = options.hashtagsBlock || "";
    const continuationMarker = options.continuationMarker || "";
    const normalizedText = normalizeText(text);
    let estimate = 1;

    for (let iteration = 0; iteration < 12; iteration += 1) {
      const plainPosts = splitPlainPosts(normalizedText, (index) => {
        const suffix = numbering ? ` (${index + 1}/${estimate})` : "";
        const continuationReserve = index < estimate - 1 ? continuationMarker.length : 0;
        const reserved =
          suffix.length +
          continuationReserve +
          (index === estimate - 1 ? hashtagsBlock.length : 0);
        return limit - reserved;
      });

      if (plainPosts.length === estimate) {
        return finalizePosts(plainPosts, {
          numbering,
          hashtagsBlock,
          continuationMarker,
        });
      }

      estimate = plainPosts.length;
    }

    return null;
  }

  function createCapacities(totalPosts, limit, options = {}) {
    const numbering = Boolean(options.numbering);
    const hashtagsBlock = options.hashtagsBlock || "";
    const continuationMarker = options.continuationMarker || "";

    return Array.from({ length: totalPosts }, (_, index) => {
      const numberingReserve = numbering ? ` (${index + 1}/${totalPosts})`.length : 0;
      const lastPostReserve = index === totalPosts - 1 ? hashtagsBlock.length : 0;
      const continuationReserve = index < totalPosts - 1 ? continuationMarker.length : 0;
      return limit - numberingReserve - lastPostReserve - continuationReserve;
    });
  }

  function finalizePosts(posts, options = {}) {
    const numbering = Boolean(options.numbering);
    const hashtagsBlock = options.hashtagsBlock || "";
    const continuationMarker = options.continuationMarker || "";

    return posts.map((post, index) => {
      const isLastPost = index === posts.length - 1;
      let output = post;

      if (!isLastPost && continuationMarker) {
        output += continuationMarker;
      }

      if (numbering) {
        output += ` (${index + 1}/${posts.length})`;
      }

      if (isLastPost && hashtagsBlock) {
        output += hashtagsBlock;
      }

      return output;
    });
  }

  function buildBalancedPosts(text, options) {
    const limit = Number(options.limit);
    const numbering = Boolean(options.numbering);
    const hashtagsBlock = options.hashtagsBlock || "";
    const normalizedText = normalizeText(text);
    const estimatedUpperBound = Math.max(
      1,
      estimatePostCount(normalizedText, limit, hashtagsBlock, numbering)
    );

    for (let totalPosts = 1; totalPosts <= estimatedUpperBound; totalPosts += 1) {
      const capacities = createCapacities(totalPosts, limit, {
        numbering,
        hashtagsBlock,
      });

      if (capacities.some((capacity) => !Number.isFinite(capacity) || capacity < 1)) {
        continue;
      }

      const units = expandUnitsForLimit(tokenizeText(normalizedText), Math.min(...capacities));
      const plan = segmentUnits(units, capacities);

      if (!plan) {
        continue;
      }

      return finalizePosts(plan, {
        numbering,
        hashtagsBlock,
      });
    }

    return null;
  }

  function buildCompactPosts(text, options) {
    const limit = Number(options.limit);
    const numbering = Boolean(options.numbering);
    const hashtagsBlock = options.hashtagsBlock || "";
    const continuationMarker = options.continuationMarker || "";
    const normalizedText = normalizeText(text);
    const estimatedUpperBound = Math.max(
      1,
      estimatePostCount(normalizedText, limit, hashtagsBlock, numbering, {
        continuationMarker,
      })
    );

    for (let totalPosts = 1; totalPosts <= estimatedUpperBound; totalPosts += 1) {
      const capacities = createCapacities(totalPosts, limit, {
        numbering,
        hashtagsBlock,
        continuationMarker,
      });

      if (capacities.some((capacity) => !Number.isFinite(capacity) || capacity < 1)) {
        continue;
      }

      const units = expandUnitsForLimit(tokenizeWords(normalizedText), Math.min(...capacities));
      const plan = segmentUnits(units, capacities);

      if (!plan) {
        continue;
      }

      return finalizePosts(plan, {
        numbering,
        hashtagsBlock,
        continuationMarker,
      });
    }

    return null;
  }

  function buildThread(text, options) {
    const limit = Number(options.limit);
    const numbering = Boolean(options.numbering);
    const splitMode = options.splitMode === "compact" ? "compact" : "paragraph";
    const userHashtags = normalizeHashtags(options.hashtags || "");
    const hashtags = buildHashtagsValue(options.hashtags || "", {
      includeSupportTag: Boolean(options.supportThreadMk),
    });
    const hashtagsBlock = hashtags ? `\n\n${hashtags}` : "";
    const plainText = normalizeText(text || "");

    if (!plainText && !userHashtags) {
      return {
        posts: [],
        hashtags,
        totalCharacters: 0,
        warning: "",
        splitMode,
      };
    }

    if (!plainText) {
      if (hashtags.length > limit) {
        throw new Error(uiText("hashtagsFullLimit"));
      }

      return {
        posts: [hashtags],
        hashtags,
        totalCharacters: hashtags.length,
        warning: "",
        splitMode,
      };
    }

    if (!Number.isFinite(limit) || limit < 1) {
      throw new Error(uiText("invalidCharacterLimit"));
    }

    if (hashtagsBlock.length >= limit) {
      throw new Error(uiText("hashtagsFullLimit"));
    }

    const singlePost = `${plainText}${hashtagsBlock}`;

    if (singlePost.length <= limit) {
      return {
        posts: [singlePost],
        hashtags,
        totalCharacters: singlePost.length,
        warning: "",
        splitMode,
      };
    }

    const normalizedText = prependThreadPrefix(plainText, selectedLanguage);

    if (numbering && limit - hashtagsBlock.length - " (1/1)".length < 1) {
      throw new Error(uiText("hashtagsNumberingNoRoom"));
    }

    const posts =
      (splitMode === "compact"
        ? buildCompactPosts(normalizedText, {
            limit,
            numbering,
            hashtagsBlock,
            continuationMarker: "...",
          })
        : buildBalancedPosts(normalizedText, {
            limit,
            numbering,
            hashtagsBlock,
          })) ||
      buildGreedyPosts(normalizedText, {
        limit,
        numbering,
        hashtagsBlock,
        continuationMarker: splitMode === "compact" ? "..." : "",
      });

    if (!posts) {
      throw new Error(uiText("splitTextFailed"));
    }

    return {
      posts,
      hashtags,
      totalCharacters: posts.reduce((sum, post) => sum + post.length, 0),
      warning: "",
      splitMode,
    };
  }

  async function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  function initApp() {
    let activeSavedDraftId = null;

    const form = document.getElementById("thread-form");
    const moreMenu = document.getElementById("more-menu");
    const menuBackdrop = document.getElementById("menu-backdrop");
    const confirmModal = document.getElementById("confirm-modal");
    const confirmModalTitle = document.getElementById("confirm-modal-title");
    const confirmModalMessage = document.getElementById("confirm-modal-message");
    const confirmModalCancelButton = document.getElementById("confirm-modal-cancel");
    const confirmModalConfirmButton = document.getElementById("confirm-modal-confirm");
    const platformLimit = document.getElementById("platform-limit");
    const customLimit = document.getElementById("custom-limit");
    const preserveLineBreaksInput = document.getElementById("preserve-line-breaks");
    const languageSelect = document.getElementById("language-select");
    const compressionStrengthSelect = document.getElementById("compression-strength");
    const numberingInput = document.getElementById("include-numbering");
    const supportThreadMkInput = document.getElementById("support-threadmk");
    const pasteButton = document.getElementById("paste-text");
    const pasteButtonLabel = pasteButton.querySelector(".panel-button-label");
    const newDraftButton = document.getElementById("new-draft");
    const saveDraftButton = document.getElementById("save-draft");
    const loadDraftButton = document.getElementById("load-drafts");
    const draftsMenu = document.getElementById("drafts-menu");
    const draftsMenuList = document.getElementById("drafts-menu-list");
    const paletteSelect = document.getElementById("palette-select");
    const largeTextToggle = document.getElementById("large-text-toggle");
    const clearCacheButton = document.getElementById("clear-cache");
    const correctionStatus = document.getElementById("correction-status");
    const correctionStatusActions = document.getElementById("correction-status-actions");
    const inlineSpellcheckButton = document.getElementById("inline-spellcheck");
    const inlineCompressButton = document.getElementById("inline-compress");
    const inlineCompressSeparator = document.getElementById("inline-compress-separator");
    const inlineTranslateButton = document.getElementById("inline-translate");
    const inlineTranslateSeparator = document.getElementById("inline-translate-separator");
    const correctButton = inlineSpellcheckButton;
    const compressButton = inlineCompressButton;
    const correctionStatusLabel = document.getElementById("correction-status-label");
    const sourceCharCount = document.getElementById("source-char-count");
    const hashtagsInput = document.getElementById("hashtags");
    const saveHashtagsButton = document.getElementById("save-hashtags");
    const loadHashtagsButton = document.getElementById("load-hashtags");
    const hashtagsMenu = document.getElementById("hashtags-menu");
    const hashtagsMenuList = document.getElementById("hashtags-menu-list");
    const sourceInput = document.getElementById("source-text");
    const resultsList = document.getElementById("results-list");
    const template = document.getElementById("post-template");
    const banner = document.getElementById("message-banner");
    const supportPromptModal = document.getElementById("support-prompt-modal");
    const supportPromptTitle = document.getElementById("support-prompt-title");
    const supportPromptMessage = document.getElementById("support-prompt-message");
    const supportPromptEnableTitle = document.getElementById("support-prompt-enable-title");
    const supportPromptEnableInput = document.getElementById("support-prompt-enable");
    const supportPromptKofiLabel = document.getElementById("support-prompt-kofi-label");
    const supportPromptPaypalLabel = document.getElementById("support-prompt-paypal-label");
    const supportPromptOkButton = document.getElementById("support-prompt-ok");
    const pageIntro = document.getElementById("page-intro");
    const pageEyebrow = document.getElementById("page-eyebrow");
    const pageHeading = document.getElementById("page-heading");
    const pageDescription = document.getElementById("page-description");
    const dismissIntroButton = document.getElementById("dismiss-intro");
    const platformLimitLabel = form.querySelector('label[for="platform-limit"]');
    const preserveLineBreaksTitle = form.querySelector('label[for="preserve-line-breaks"] .toggle-title');
    const preserveLineBreaksTooltip = document.getElementById("preserve-line-breaks-tooltip");
    const languageSelectLabel = form.querySelector('label[for="language-select"]');
    const compressionStrengthLabel = document.getElementById("compression-strength-label");
    const compressionStrengthTooltip = document.getElementById("compression-strength-tooltip");
    const numberingTitle = form.querySelector('label[for="include-numbering"] .toggle-title');
    const numberingTooltip = document.getElementById("number-posts-tooltip");
    const supportThreadMkTitle = form.querySelector('label[for="support-threadmk"] .toggle-title');
    const supportThreadMkTooltip = document.getElementById("support-threadmk-tooltip");
    const paletteSelectLabel = form.querySelector('label[for="palette-select"]');
    const largeTextTitle = form.querySelector('label[for="large-text-toggle"] .toggle-title');
    const supportTitleText = form.querySelector(".menu-support-title span");
    const menuSignoff = form.querySelector(".menu-signoff");
    const metaDescription = document.getElementById("meta-description");
    const ogTitleMeta = document.getElementById("og-title");
    const ogDescriptionMeta = document.getElementById("og-description");
    const ogLocaleMeta = document.getElementById("og-locale");
    const twitterTitleMeta = document.getElementById("twitter-title");
    const twitterDescriptionMeta = document.getElementById("twitter-description");
    const themeColorMeta = document.getElementById("theme-color-meta");
    const platformLongFormOption = platformLimit.querySelector('option[value="500"]');
    const platformCustomOption = platformLimit.querySelector('option[value="custom"]');
    const languageEnglishOption = languageSelect.querySelector('option[value="en"]');
    const languageSpanishOption = languageSelect.querySelector('option[value="es"]');
    const paletteDarkOption = paletteSelect.querySelector('option[value="dark"]');
    const paletteLightOption = paletteSelect.querySelector('option[value="light"]');
    const compressionSoftOption = compressionStrengthSelect.querySelector('option[value="soft"]');
    const compressionMediumOption = compressionStrengthSelect.querySelector('option[value="medium"]');
    const compressionHeavyOption = compressionStrengthSelect.querySelector('option[value="heavy"]');
    let confirmModalResolver = null;
    let saveDraftFeedbackTimeoutId = null;
    let compressInFlight = false;
    let supportPromptCounter = 0;
    let supportPromptTimeoutId = null;

    function getSplitModeValue() {
      return preserveLineBreaksInput.checked ? "paragraph" : "compact";
    }

    function loadColorPresetPreference() {
      try {
        const storedPreset = window.localStorage.getItem(COLOR_PRESET_STORAGE_KEY);
        if (storedPreset === "blue-ocean") {
          return "dark";
        }

        if (storedPreset && Object.prototype.hasOwnProperty.call(COLOR_PRESETS, storedPreset)) {
          return storedPreset;
        }

        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light") {
          return "light";
        }

        if (storedTheme === "dark") {
          return "dark";
        }

        return DEFAULT_COLOR_PRESET;
      } catch (error) {
        return DEFAULT_COLOR_PRESET;
      }
    }

    function loadTextSizePreference() {
      try {
        const storedTextSize = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
        return storedTextSize === "large" ? "large" : "normal";
      } catch (error) {
        return "normal";
      }
    }

    function loadSupportPromptCounter() {
      try {
        const storedCounter = window.sessionStorage.getItem(SUPPORT_PROMPT_COUNTER_STORAGE_KEY);
        const parsedCounter = Number(storedCounter);
        if (!Number.isFinite(parsedCounter) || parsedCounter < 0) {
          return 0;
        }
        return Math.floor(parsedCounter);
      } catch (error) {
        return 0;
      }
    }

    function loadInterfaceLanguagePreference() {
      try {
        const storedLanguage = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
        if (storedLanguage === "es" || storedLanguage === "en") {
          return storedLanguage;
        }
        return null;
      } catch (error) {
        return null;
      }
    }

    function getScopedStorageKey(baseKey, language = interfaceLanguage) {
      const safeLanguage = language === "es" ? "es" : "en";
      return `${baseKey}_${safeLanguage}`;
    }

    function readStorageItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    }

    function writeStorageItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        return false;
      }

      return true;
    }

    function removeStorageItem(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        return false;
      }

      return true;
    }

    function readScopedStorageItem(baseKey, language = interfaceLanguage) {
      const scopedKey = getScopedStorageKey(baseKey, language);
      const scopedValue = readStorageItem(scopedKey);
      if (scopedValue !== null) {
        return scopedValue;
      }

      const legacyValue = readStorageItem(baseKey);
      if (legacyValue === null) {
        return null;
      }

      if (writeStorageItem(scopedKey, legacyValue)) {
        removeStorageItem(baseKey);
      }

      return legacyValue;
    }

    function loadIntroDismissedPreference() {
      try {
        return window.localStorage.getItem(INTRO_DISMISSED_STORAGE_KEY) === "true";
      } catch (error) {
        return false;
      }
    }

    function detectBrowserLanguage() {
      const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language];

      for (const language of browserLanguages) {
        const normalized = String(language || "").trim().toLowerCase();

        if (normalized === "es" || normalized.startsWith("es-")) {
          return "es";
        }

        if (normalized === "en" || normalized.startsWith("en-")) {
          return "en";
        }
      }

      return null;
    }

    function applyColorPreset(preset) {
      const safePreset = Object.prototype.hasOwnProperty.call(COLOR_PRESETS, preset)
        ? preset
        : DEFAULT_COLOR_PRESET;
      const nextPreset = COLOR_PRESETS[safePreset];
      document.documentElement.dataset.palette = nextPreset.palette;
      document.documentElement.dataset.theme = nextPreset.theme;

      syncThemeColorMeta();

      if (paletteSelect) {
        paletteSelect.value = safePreset;
      }

      try {
        window.localStorage.setItem(COLOR_PRESET_STORAGE_KEY, safePreset);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextPreset.theme);
      } catch (error) {
        return;
      }
    }

    function syncThemeColorMeta() {
      if (!themeColorMeta) {
        return;
      }

      const themeColor = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-color")
        .trim();

      if (themeColor) {
        themeColorMeta.setAttribute("content", themeColor);
      }
    }

    function applyTextSize(textSize) {
      const safeTextSize = textSize === "large" ? "large" : "normal";
      document.documentElement.dataset.textSize = safeTextSize;

      if (largeTextToggle) {
        largeTextToggle.checked = safeTextSize === "large";
      }

      try {
        window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, safeTextSize);
      } catch (error) {
        return;
      }
    }

    function clearSupportPromptTimeout() {
      if (supportPromptTimeoutId) {
        window.clearTimeout(supportPromptTimeoutId);
        supportPromptTimeoutId = null;
      }
    }

    function setSupportPromptCounter(nextValue) {
      const safeValue = supportThreadMkInput.checked
        ? 0
        : Math.max(0, Math.floor(Number(nextValue) || 0));

      supportPromptCounter = safeValue;

      try {
        window.sessionStorage.setItem(SUPPORT_PROMPT_COUNTER_STORAGE_KEY, String(safeValue));
      } catch (error) {
        return;
      }
    }

    function closeSupportPromptModal() {
      if (supportPromptModal) {
        supportPromptModal.hidden = true;
      }
    }

    function showSupportPromptModal() {
      if (!supportPromptModal) {
        return;
      }

      if (supportPromptEnableInput) {
        supportPromptEnableInput.checked = supportThreadMkInput.checked;
      }

      supportPromptModal.hidden = false;
      supportPromptOkButton?.focus();
    }

    function updateMenuSignoffText() {
      if (!menuSignoff) {
        return;
      }

      const textNode = Array.from(menuSignoff.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (!textNode) {
        return;
      }

      textNode.textContent = `${uiText("signoff")} `;
    }

    function applyIntroVisibility(isDismissed, options = {}) {
      if (!pageIntro) {
        return;
      }

      pageIntro.hidden = Boolean(isDismissed);

      if (options.persist) {
        try {
          window.localStorage.setItem(INTRO_DISMISSED_STORAGE_KEY, isDismissed ? "true" : "false");
        } catch (error) {
          return;
        }
      }
    }

    function applyUiTranslations() {
      document.title = uiText("documentTitle");
      pageEyebrow.textContent = uiText("pageEyebrow");
      pageHeading.textContent = uiText("pageHeading");
      pageDescription.textContent = uiText("pageDescription");
      platformLimitLabel.textContent = uiText("charactersPerPost");
      customLimit.setAttribute("aria-label", uiText("customCharacterLimit"));
      preserveLineBreaksTitle.textContent = uiText("preserveLineBreaks");
      if (preserveLineBreaksTooltip) {
        preserveLineBreaksTooltip.textContent = uiText("preserveLineBreaksTooltip");
      }
      languageSelectLabel.textContent = uiText("language");
      compressionStrengthLabel.textContent = uiText("compressionStrength");
      if (compressionStrengthTooltip) {
        compressionStrengthTooltip.textContent = uiText("compressionStrengthTooltip");
      }
      numberingTitle.textContent = uiText("numberPosts");
      if (numberingTooltip) {
        numberingTooltip.textContent = uiText("numberPostsTooltip");
      }
      supportThreadMkTitle.innerHTML = `${escapeHtml(uiText("supportThreadMkPrefix"))} <span class="menu-threadmk-accent">${escapeHtml(SUPPORT_HASHTAG)}</span>`;
      if (supportThreadMkTooltip) {
        supportThreadMkTooltip.textContent = uiText("supportThreadMkTooltip");
      }
      paletteSelectLabel.textContent = uiText("theme");
      largeTextTitle.textContent = uiText("largerText");
      inlineSpellcheckButton.textContent = uiText("spellcheck");
      inlineCompressButton.textContent = uiText("compress");
      clearCacheButton.textContent = uiText("clearCache");
      if (supportPromptTitle) {
        supportPromptTitle.textContent = uiText("supportPromptTitle");
      }
      if (supportPromptMessage) {
        supportPromptMessage.textContent = uiText("supportPromptMessage");
      }
      if (supportPromptEnableTitle) {
        const safeValue = escapeHtml(uiText("supportPromptEnableTitle"));
        supportPromptEnableTitle.innerHTML = safeValue.replace(
          escapeHtml(SUPPORT_HASHTAG),
          `<span class="menu-threadmk-accent">${escapeHtml(SUPPORT_HASHTAG)}</span>`,
        );
      }
      if (supportPromptKofiLabel) {
        supportPromptKofiLabel.textContent = uiText("supportPromptKofi");
      }
      if (supportPromptPaypalLabel) {
        supportPromptPaypalLabel.textContent = uiText("supportPromptPaypal");
      }
      if (supportPromptOkButton) {
        supportPromptOkButton.textContent = uiText("ok");
      }
      supportTitleText.textContent = uiText("supportTitle");
      sourceInput.dataset.placeholder = uiText("enterTextHere");
      newDraftButton.textContent = uiText("newDraft");
      saveDraftButton.textContent = saveDraftFeedbackTimeoutId ? uiText("savedDraft") : uiText("saveDraft");
      loadDraftButton.textContent = uiText("loadDraft");
      hashtagsInput.placeholder = uiText("enterHashtagsHere");
      saveHashtagsButton.textContent = uiText("save");
      loadHashtagsButton.textContent = uiText("load");
      dismissIntroButton.setAttribute("aria-label", uiText("hideIntro"));
      dismissIntroButton.setAttribute("title", uiText("hideIntro"));
      loadDraftButton.setAttribute("aria-label", uiText("loadDraft"));
      loadDraftButton.setAttribute("title", uiText("loadDraft"));
      confirmModalTitle.textContent = uiText("spellcheckPromptTitle");
      confirmModalCancelButton.textContent = uiText("cancel");
      pasteButtonLabel.textContent = uiText("paste");
      if (pasteButton.getAttribute("aria-label") !== uiText("pasted")) {
        pasteButton.setAttribute("aria-label", uiText("paste"));
        pasteButton.setAttribute("title", uiText("paste"));
      }

      if (metaDescription) {
        metaDescription.setAttribute("content", uiText("metaDescription"));
      }

      if (ogTitleMeta) {
        ogTitleMeta.setAttribute("content", uiText("documentTitle"));
      }

      if (ogDescriptionMeta) {
        ogDescriptionMeta.setAttribute("content", uiText("metaDescription"));
      }

      if (ogLocaleMeta) {
        ogLocaleMeta.setAttribute("content", interfaceLanguage === "es" ? "es_ES" : "en_US");
      }

      if (twitterTitleMeta) {
        twitterTitleMeta.setAttribute("content", uiText("documentTitle"));
      }

      if (twitterDescriptionMeta) {
        twitterDescriptionMeta.setAttribute("content", uiText("metaDescription"));
      }

      platformLongFormOption.textContent = `${uiText("longForm")} · 500`;
      platformCustomOption.textContent = interfaceLanguage === "es" ? "Personalizado" : "Custom";
      languageEnglishOption.textContent = getLanguageLabel("en", { capitalize: true });
      languageSpanishOption.textContent = getLanguageLabel("es", { capitalize: true });
      paletteDarkOption.textContent = uiText("paletteDark");
      paletteLightOption.textContent = uiText("paletteLight");
      compressionSoftOption.textContent = uiText("compressSoft");
      compressionMediumOption.textContent = uiText("compressMedium");
      compressionHeavyOption.textContent = uiText("compressHeavy");

      updateMenuSignoffText();
      updateSourceCharCount();
      syncBanner();
      updateTranslateButtonState();

      if (!hashtagsMenu.hidden) {
        renderHashtagMenu();
      }

      if (!draftsMenu.hidden) {
        renderDraftMenu();
      }
    }

    function closeConfirmModal(result = false) {
      if (!confirmModalResolver) {
        confirmModal.hidden = true;
        return;
      }

      const resolve = confirmModalResolver;
      confirmModalResolver = null;
      confirmModal.hidden = true;
      resolve(Boolean(result));
    }

    function openConfirmModal(options = {}) {
      confirmModalTitle.textContent = options.title || uiText("spellcheckPromptTitle");
      confirmModalMessage.textContent = options.message || "";
      const showCancel = options.showCancel !== false;
      confirmModalCancelButton.textContent = options.cancelLabel || uiText("cancel");
      confirmModalConfirmButton.textContent = options.confirmLabel || uiText("continue");
      confirmModalCancelButton.hidden = !showCancel;
      confirmModal.hidden = false;
      confirmModalConfirmButton.focus();

      return new Promise((resolve) => {
        confirmModalResolver = resolve;
      });
    }

    function applyInterfaceLanguage(language, options = {}) {
      interfaceLanguage = language === "es" ? "es" : "en";

      if (languageSelect) {
        languageSelect.value = interfaceLanguage;
      }

      document.documentElement.lang = interfaceLanguage;
      applyLanguageSelection(interfaceLanguage);
      applyUiTranslations();
      syncLanguageStatus();

      if (options.persist) {
        try {
          window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, interfaceLanguage);
        } catch (error) {
          return;
        }
      }
    }

    function loadDraftState() {
      try {
        const storedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (!storedDraft) {
          return null;
        }

        const parsedDraft = JSON.parse(storedDraft);
        return parsedDraft && typeof parsedDraft === "object" ? parsedDraft : null;
      } catch (error) {
        return null;
      }
    }

    function saveDraftState() {
      try {
        window.sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            sourceText: getSourceText(),
            hashtags: hashtagsInput.value,
            platformLimit: platformLimit.value,
            customLimit: customLimit.value,
            splitMode: getSplitModeValue(),
            compressionStrength: normalizeCompressionStrength(compressionStrengthSelect.value),
            numbering: numberingInput.checked,
            supportThreadMk: supportThreadMkInput.checked,
            activeSavedDraftId,
          }),
        );
      } catch (error) {
        return;
      }
    }

    function restoreDraftState() {
      const draft = loadDraftState();
      if (!draft) {
        return false;
      }

      if (typeof draft.platformLimit === "string") {
        platformLimit.value = draft.platformLimit === "custom" ? "custom" : draft.platformLimit;
      }

      if (typeof draft.customLimit === "string" && draft.customLimit) {
        customLimit.value = draft.customLimit;
      }

      if (typeof draft.splitMode === "string") {
        preserveLineBreaksInput.checked = draft.splitMode === "paragraph";
      }

      if (typeof draft.compressionStrength === "string") {
        compressionStrengthSelect.value = normalizeCompressionStrength(draft.compressionStrength);
      }

      numberingInput.checked = Boolean(draft.numbering);
      supportThreadMkInput.checked =
        typeof draft.supportThreadMk === "boolean" ? draft.supportThreadMk : true;
      hashtagsInput.value = typeof draft.hashtags === "string" ? draft.hashtags : "";
      setSourceText(typeof draft.sourceText === "string" ? draft.sourceText : "");
      activeSavedDraftId =
        typeof draft.activeSavedDraftId === "string" && draft.activeSavedDraftId.trim()
          ? draft.activeSavedDraftId
          : null;

      return true;
    }

    function getHashtagTokens(value = hashtagsInput.value) {
      const normalized = normalizeHashtags(value || "");
      return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
    }

    function getCurrentDraftPayload() {
      return {
        sourceText: getSourceText(),
        hashtags: normalizeHashtags(hashtagsInput.value || ""),
      };
    }

    function buildDraftTitle(draft) {
      const sourceTitle = normalizeText(draft?.sourceText || "").replace(/\s+/g, " ");
      const hashtagTitle = normalizeHashtags(draft?.hashtags || "").replace(/\s+/g, " ");
      const baseTitle = sourceTitle || hashtagTitle || uiText("untitledDraft");
      return baseTitle.slice(0, 20).trimEnd() || uiText("untitledDraft");
    }

    function loadSavedDrafts() {
      try {
        const stored = readScopedStorageItem(SAVED_DRAFTS_STORAGE_KEY);
        if (!stored) {
          return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id:
              typeof entry.id === "string" && entry.id.trim()
                ? entry.id
                : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            sourceText: typeof entry.sourceText === "string" ? entry.sourceText : "",
            hashtags: normalizeHashtags(typeof entry.hashtags === "string" ? entry.hashtags : ""),
            savedAt:
              typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
                ? entry.savedAt
                : Date.now(),
            posted: Boolean(entry.posted),
          }))
          .filter((entry) => normalizeText(entry.sourceText) || entry.hashtags);
      } catch (error) {
        return [];
      }
    }

    function saveSavedDrafts(drafts) {
      try {
        window.localStorage.setItem(
          getScopedStorageKey(SAVED_DRAFTS_STORAGE_KEY),
          JSON.stringify(
            drafts
              .filter((entry) => entry && typeof entry === "object")
              .map((entry) => ({
                id:
                  typeof entry.id === "string" && entry.id.trim()
                    ? entry.id
                    : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                sourceText: typeof entry.sourceText === "string" ? entry.sourceText : "",
                hashtags: normalizeHashtags(typeof entry.hashtags === "string" ? entry.hashtags : ""),
                savedAt:
                  typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
                    ? entry.savedAt
                    : Date.now(),
                posted: Boolean(entry.posted),
              }))
              .filter((entry) => normalizeText(entry.sourceText) || entry.hashtags),
          ),
        );
      } catch (error) {
        return;
      }
    }

    function markSavedDraftPosted(draftId) {
      if (!draftId) {
        return;
      }

      const savedDrafts = loadSavedDrafts();
      const targetIndex = savedDrafts.findIndex((entry) => entry.id === draftId);
      if (targetIndex < 0 || savedDrafts[targetIndex].posted) {
        return;
      }

      const nextDraft = {
        ...savedDrafts[targetIndex],
        posted: true,
      };
      saveSavedDrafts([
        nextDraft,
        ...savedDrafts.filter((_, index) => index !== targetIndex),
      ]);

      if (!draftsMenu.hidden) {
        renderDraftMenu();
      }
    }

    function loadSavedHashtags() {
      try {
        const stored = readScopedStorageItem(SAVED_HASHTAGS_STORAGE_KEY);
        if (!stored) {
          return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          return [];
        }

        return Array.from(
          new Set(
            parsed.flatMap((value) => getHashtagTokens(String(value || ""))),
          ),
        );
      } catch (error) {
        return [];
      }
    }

    function saveSavedHashtags(values) {
      try {
        window.localStorage.setItem(
          getScopedStorageKey(SAVED_HASHTAGS_STORAGE_KEY),
          JSON.stringify(
            Array.from(
              new Set(
                values.flatMap((value) => getHashtagTokens(String(value || ""))),
              ),
            ),
          ),
        );
      } catch (error) {
        return;
      }
    }

    function closeHashtagsMenu() {
      hashtagsMenu.hidden = true;
      hashtagsMenu.style.maxHeight = "";
      loadHashtagsButton.setAttribute("aria-expanded", "false");
    }

    function closeDraftsMenu() {
      draftsMenu.hidden = true;
      draftsMenu.style.maxHeight = "";
      loadDraftButton.setAttribute("aria-expanded", "false");
    }

    function syncHashtagsMenuSize() {
      hashtagsMenu.style.maxHeight = "";

      if (hashtagsMenu.hidden) {
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const menuRect = hashtagsMenu.getBoundingClientRect();
      const availableHeight = Math.max(0, Math.floor(viewportHeight - menuRect.top - 12));

      if (availableHeight > 0) {
        hashtagsMenu.style.maxHeight = `${availableHeight}px`;
      }
    }

    function syncDraftsMenuSize() {
      draftsMenu.style.maxHeight = "";

      if (draftsMenu.hidden) {
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const menuRect = draftsMenu.getBoundingClientRect();
      const availableHeight = Math.max(0, Math.floor(viewportHeight - menuRect.top - 12));

      if (availableHeight > 0) {
        draftsMenu.style.maxHeight = `${availableHeight}px`;
      }
    }

    function updateHashtagButtonsState() {
      const currentTokens = getHashtagTokens();
      const saved = loadSavedHashtags();
      const savedSet = new Set(saved);
      saveHashtagsButton.disabled =
        !currentTokens.length || currentTokens.every((token) => savedSet.has(token));
      loadHashtagsButton.disabled = !saved.length;

      if (!saved.length) {
        closeHashtagsMenu();
      }
    }

    function updateDraftButtonsState() {
      const currentDraft = getCurrentDraftPayload();
      const hasDraftContent = Boolean(normalizeText(currentDraft.sourceText) || currentDraft.hashtags);
      const savedDrafts = loadSavedDrafts();
      newDraftButton.disabled = !hasDraftContent;
      saveDraftButton.disabled = !hasDraftContent;
      loadDraftButton.disabled = !savedDrafts.length;

      if (!savedDrafts.length) {
        closeDraftsMenu();
      }
    }

    function renderHashtagMenu() {
      const saved = loadSavedHashtags();
      const currentTokens = new Set(getHashtagTokens());

      if (!saved.length) {
        hashtagsMenuList.innerHTML = `<p class="hashtags-menu-empty">${uiText("noSavedHashtags")}</p>`;
        updateHashtagButtonsState();
        return;
      }

      hashtagsMenuList.innerHTML = saved
        .map((value) => {
          const encodedValue = encodeURIComponent(value);
          const checked = getHashtagTokens(value).every((token) => currentTokens.has(token));

          return `
            <div class="hashtags-menu-entry">
              <label class="hashtags-menu-checkbox-row">
                <input
                  class="hashtags-menu-checkbox"
                  type="checkbox"
                  data-value="${encodedValue}"
                  ${checked ? "checked" : ""}
                />
                <span class="hashtags-menu-label">${escapeHtml(value)}</span>
              </label>
              <button
                class="hashtags-menu-delete-button"
                type="button"
                data-delete-value="${encodedValue}"
                aria-label="${uiText("deleteSavedHashtag")}"
                title="${uiText("deleteSavedHashtag")}"
              >
                <img
                  class="hashtags-menu-delete-icon"
                  src="./assets/icons/close_circle_line.svg"
                  alt=""
                  width="20"
                  height="20"
                  aria-hidden="true"
                />
              </button>
            </div>
          `;
        })
        .join("");

      updateHashtagButtonsState();
      syncHashtagsMenuSize();
    }

    function openHashtagsMenu() {
      closeDraftsMenu();
      renderHashtagMenu();
      hashtagsMenu.hidden = false;
      loadHashtagsButton.setAttribute("aria-expanded", "true");
      syncHashtagsMenuSize();
    }

    function renderDraftMenu() {
      const savedDrafts = loadSavedDrafts();

      if (!savedDrafts.length) {
        draftsMenuList.innerHTML = `<p class="hashtags-menu-empty">${uiText("noSavedDrafts")}</p>`;
        updateDraftButtonsState();
        return;
      }

      draftsMenuList.innerHTML = savedDrafts
        .map((draft) => {
          const encodedId = encodeURIComponent(draft.id);
          const title = buildDraftTitle(draft);
          const fullTitle =
            normalizeText(draft.sourceText || "").replace(/\s+/g, " ") ||
            normalizeHashtags(draft.hashtags || "").replace(/\s+/g, " ") ||
            title;

          return `
            <div class="drafts-menu-entry">
              <button
                class="drafts-menu-select-button ${draft.posted ? "is-posted" : ""}"
                type="button"
                data-draft-id="${encodedId}"
                title="${escapeHtml(fullTitle)}"
              >
                <span class="drafts-menu-label">${escapeHtml(title)}...</span>
              </button>
              <button
                class="drafts-menu-delete-button"
                type="button"
                data-delete-draft-id="${encodedId}"
                aria-label="${uiText("deleteSavedDraft")}"
                title="${uiText("deleteSavedDraft")}"
              >
                <img
                  class="drafts-menu-delete-icon"
                  src="./assets/icons/close_circle_line.svg"
                  alt=""
                  width="20"
                  height="20"
                  aria-hidden="true"
                />
              </button>
            </div>
          `;
        })
        .join("");

      updateDraftButtonsState();
      syncDraftsMenuSize();
    }

    function openDraftsMenu() {
      closeHashtagsMenu();
      renderDraftMenu();
      draftsMenu.hidden = false;
      loadDraftButton.setAttribute("aria-expanded", "true");
      syncDraftsMenuSize();
    }

    function toggleDraftsMenu() {
      if (draftsMenu.hidden) {
        openDraftsMenu();
        return;
      }

      closeDraftsMenu();
    }

    function handleLoadDraftsClick(event) {
      toggleDraftsMenu();

      if (event.detail > 0) {
        loadDraftButton.blur();
      }
    }

    function toggleHashtagsMenu() {
      if (hashtagsMenu.hidden) {
        openHashtagsMenu();
        return;
      }

      closeHashtagsMenu();
    }

    function handleLoadHashtagsClick(event) {
      toggleHashtagsMenu();

      if (event.detail > 0) {
        loadHashtagsButton.blur();
      }
    }

    let sourceMarkupActive = false;
    let translateInFlight = false;
    let transientBannerMessage = "";
    let transientBannerHtml = "";

    function setCorrectionStatus(message, options = {}) {
      const hasMessage = Boolean(String(message || "").trim());
      correctionStatusLabel.textContent = message;
      correctionStatusLabel.hidden = !hasMessage;
      correctionStatus.hidden = !hasMessage;
    }

    function syncBanner() {
      const message = transientBannerMessage;
      const html = transientBannerHtml;
      if (!message && !html) {
        banner.hidden = true;
        banner.textContent = "";
        banner.innerHTML = "";
        return;
      }

      banner.hidden = false;
      if (html) {
        banner.innerHTML = html;
        return;
      }

      banner.textContent = message;
    }

    function getSourceText() {
      return String(sourceInput.textContent || "")
        .replace(/^\uFEFF/, "")
        .replace(/\u00a0/g, " ")
        .replace(/\r\n?/g, "\n");
    }

    function setSourceText(text) {
      sourceInput.textContent = String(text || "");
      sourceMarkupActive = false;
    }

    function setSourceHtml(html) {
      sourceInput.innerHTML = html || "";
      sourceMarkupActive = Boolean(sourceInput.querySelector(".change, .flag, .reverted"));
    }

    function getSelectionOffsets(element) {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) {
        return null;
      }

      const range = selection.getRangeAt(0);
      if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) {
        return null;
      }

      const startRange = range.cloneRange();
      startRange.selectNodeContents(element);
      startRange.setEnd(range.startContainer, range.startOffset);

      const endRange = range.cloneRange();
      endRange.selectNodeContents(element);
      endRange.setEnd(range.endContainer, range.endOffset);

      return {
        start: startRange.toString().length,
        end: endRange.toString().length,
      };
    }

    function setSelectionOffsets(element, start, end = start) {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }

      const safeStart = Math.max(0, start);
      const safeEnd = Math.max(safeStart, end);
      const range = document.createRange();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      if (!node) {
        range.setStart(element, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

      let current = 0;
      let lastNode = node;
      let startNode = null;
      let endNode = null;
      let startOffset = 0;
      let endOffset = 0;

      while (node) {
        lastNode = node;
        const length = node.textContent.length;

        if (!startNode && safeStart <= current + length) {
          startNode = node;
          startOffset = Math.min(length, safeStart - current);
        }

        if (!endNode && safeEnd <= current + length) {
          endNode = node;
          endOffset = Math.min(length, safeEnd - current);
          break;
        }

        current += length;
        node = walker.nextNode();
      }

      if (!startNode) {
        startNode = lastNode;
        startOffset = lastNode.textContent.length;
      }

      if (!endNode) {
        endNode = lastNode;
        endOffset = lastNode.textContent.length;
      }

      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function focusSourceInput() {
      sourceInput.focus();
      const cursor = getSourceText().length;
      setSelectionOffsets(sourceInput, cursor);
    }

    function flattenSourceMarkupPreservingSelection() {
      if (!sourceMarkupActive) {
        return;
      }

      const selection = getSelectionOffsets(sourceInput);
      const plainText = getSourceText();
      setSourceText(plainText);
      sourceInput.focus();

      if (selection) {
        setSelectionOffsets(
          sourceInput,
          Math.min(selection.start, plainText.length),
          Math.min(selection.end, plainText.length),
        );
      }
    }

    function syncLanguageStatus() {
      const hasText = Boolean(normalizeText(getSourceText()));
      setCorrectionStatus("");
      correctionStatusActions.hidden = !hasText;
    }

    function updateSourceCharCount() {
      sourceCharCount.textContent = uiText("charCount", { count: getSourceText().length });
    }

    function canUseClipboardRead() {
      return Boolean(
        window.isSecureContext &&
          navigator.clipboard &&
          typeof navigator.clipboard.readText === "function"
      );
    }

    function applyLanguageSelection(language) {
      selectedLanguage = language === "es" ? "es" : "en";
      syncLanguageStatus();
    }

    function getTranslateButtonLabel(language = getOppositeLanguage()) {
      return uiText("translateToLanguage", {
        language: getLanguageLabel(language, {
          locale: interfaceLanguage,
          capitalize: true,
        }),
      });
    }

    function getTranslatingButtonLabel(language = getOppositeLanguage()) {
      return uiText("translatingToLanguage", {
        language: getLanguageLabel(language, {
          locale: interfaceLanguage,
          capitalize: true,
        }),
      });
    }

    function getGeneratedPostCount() {
      return resultsList.querySelectorAll(".post-card").length;
    }

    function syncInlineActionSeparators() {
      if (!inlineCompressSeparator || !inlineCompressButton || !inlineTranslateSeparator || !inlineTranslateButton) {
        return;
      }

      const showCompress = !inlineCompressButton.hidden;
      const showTranslate = !inlineTranslateButton.hidden;

      inlineCompressSeparator.hidden = !showCompress && !showTranslate;
      inlineTranslateSeparator.hidden = !showCompress || !showTranslate;
    }

    function updateTranslateButtonState() {
      if (!inlineTranslateButton || !inlineTranslateSeparator) {
        return;
      }

      const hasResults = getGeneratedPostCount() > 0;
      const normalizedSourceText = normalizeText(getSourceText());
      const hasSourceText = Boolean(normalizedSourceText);
      const meetsMinimumLength =
        hasSourceText && normalizedSourceText.length >= MIN_TRANSLATION_SOURCE_CHARACTERS;
      const isVisible = hasResults && meetsMinimumLength;

      inlineTranslateSeparator.hidden = !isVisible;
      inlineTranslateButton.hidden = !isVisible;
      inlineTranslateButton.disabled = translateInFlight;

      if (!translateInFlight) {
        const targetLanguage = getOppositeLanguage();
        const buttonLabel = getTranslateButtonLabel(targetLanguage);
        inlineTranslateButton.textContent = buttonLabel;
        inlineTranslateButton.setAttribute("aria-label", buttonLabel);
      }

      syncInlineActionSeparators();
    }

    function updateCorrectButtonState() {
      const normalizedText = normalizeText(getSourceText());
      const disabled = !normalizedText;
      const compressionEligible = getGeneratedPostCount() > 1;
      const compressionDisabled = compressInFlight || disabled || !compressionEligible;
      correctButton.disabled = disabled || compressInFlight;
      compressButton.disabled = compressionDisabled;
      inlineSpellcheckButton.disabled = disabled || compressInFlight;
      inlineCompressButton.disabled = compressionDisabled;
      inlineCompressButton.hidden = !compressionEligible;
      syncInlineActionSeparators();
    }

    function getLimitValue() {
      return platformLimit.value === "custom"
        ? Number(customLimit.value)
        : Number(platformLimit.value);
    }

    function renderEmpty() {
      resultsList.classList.add("empty");
      resultsList.innerHTML = '<div class="empty-state"></div>';
    }

    function renderPosts(posts) {
      resultsList.classList.remove("empty");
      resultsList.innerHTML = "";
      const copyButtons = [];

      posts.forEach((post, index) => {
        const fragment = template.content.cloneNode(true);
        const postCard = fragment.querySelector(".post-card");
        const postLabel = fragment.querySelector(".post-label");
        const postBody = fragment.querySelector(".post-body");
        const copyButton = fragment.querySelector(".copy-button");
        const copyButtonLabel = fragment.querySelector(".panel-button-label");
        const postCharCount = fragment.querySelector(".post-char-count");
        postLabel.textContent = uiText("postLabel", {
          index: index + 1,
          total: posts.length,
        });
        postCharCount.textContent = uiText("charCount", { count: post.length });
        postBody.innerHTML = renderPostHtml(post, {
          muteHashtags: index === posts.length - 1,
        });
        copyButton.dataset.value = post;
        copyButtonLabel.textContent = uiText("copy");
        copyButton.setAttribute("aria-label", uiText("copyPost"));
        copyButton.setAttribute("title", uiText("copyPost"));
        copyButton.disabled = posts.length > 1 && index > 0;
        copyButtons.push(copyButton);

        copyButton.addEventListener("click", async () => {
          try {
            await copyText(post);
            postCard.classList.add("copied");
            copyButton.classList.add("copied");
            copyButtonLabel.textContent = uiText("copied");
            copyButton.setAttribute("aria-label", uiText("copied"));
            copyButton.setAttribute("title", uiText("copied"));
            if (copyButtons[index + 1]) {
              copyButtons[index + 1].disabled = false;
            }
            if (index === posts.length - 1) {
              markSavedDraftPosted(activeSavedDraftId);
              if (supportThreadMkInput.checked) {
                clearSupportPromptTimeout();
                setSupportPromptCounter(0);
              } else {
                setSupportPromptCounter(supportPromptCounter + 1);
              }
              updateTranslateButtonState();
            }
            window.setTimeout(() => {
              copyButton.classList.remove("copied");
              copyButtonLabel.textContent = uiText("copy");
              copyButton.setAttribute("aria-label", uiText("copyPost"));
              copyButton.setAttribute("title", uiText("copyPost"));
            }, 1400);
          } catch (error) {
            setBanner(uiText("copyFailed"));
          }
        });

        resultsList.appendChild(fragment);
      });
    }

    function setBanner(message) {
      transientBannerMessage = String(message || "").trim();
      transientBannerHtml = "";
      syncBanner();
    }

    function normalizePastedText(text) {
      return String(text ?? "")
        .replace(/^\uFEFF/, "")
        .replace(/\u00a0/g, " ")
        .replace(/\r\n?/g, "\n");
    }

    function insertTextAtCursor(text) {
      const safeText = normalizePastedText(text);
      sourceInput.focus();
      const selection = window.getSelection();

      if (
        !selection ||
        !selection.rangeCount ||
        !sourceInput.contains(selection.anchorNode)
      ) {
        const nextValue = `${getSourceText()}${safeText}`;
        setSourceText(nextValue);
        focusSourceInput();
        return;
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(safeText);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function trimLeadingDraftPadding() {
      const currentValue = getSourceText();
      const nextValue = currentValue
        .replace(/^\uFEFF/, "")
        .replace(/^[\s\u00A0]+/, "");

      if (nextValue === currentValue) {
        return;
      }

      const trimmedCharacters = currentValue.length - nextValue.length;
      const selection = getSelectionOffsets(sourceInput);
      setSourceText(nextValue);
      sourceInput.focus();

      if (selection) {
        setSelectionOffsets(
          sourceInput,
          Math.max(0, selection.start - trimmedCharacters),
          Math.max(0, selection.end - trimmedCharacters),
        );
      }
    }

    function toggleAllMatches(original, toState) {
      const normalized = normalizeWord(original);
      const nodes = sourceInput.querySelectorAll("[data-original]");

      nodes.forEach((node) => {
        const nodeOriginal = decodeURIComponent(node.dataset.original || "");
        if (normalizeWord(nodeOriginal) !== normalized) {
          return;
        }

        const nodeCorrected = decodeURIComponent(node.dataset.corrected || "");
        if (toState === "reverted") {
          node.textContent = nodeOriginal;
          node.classList.remove("change");
          node.classList.add("reverted");
          return;
        }

        node.textContent = nodeCorrected || node.textContent;
        node.classList.remove("reverted");
        node.classList.add("change");
      });

      sourceMarkupActive = Boolean(sourceInput.querySelector(".change, .flag, .reverted"));
    }

    function render() {
      try {
        if (platformLimit.value === "custom") {
          customLimit.hidden = false;
        } else {
          customLimit.hidden = true;
        }

        const rawText = getSourceText();
        const limit = getLimitValue();
        const userHashtags = normalizeHashtags(hashtagsInput.value);
        updateCorrectButtonState();
        updateSourceCharCount();
        updateHashtagButtonsState();
        updateDraftButtonsState();

        if (!normalizeText(rawText) && !userHashtags) {
          syncLanguageStatus();
          setBanner("");
          renderEmpty();
          return;
        }

        syncLanguageStatus();

        const result = buildThread(rawText, {
          limit,
          numbering: numberingInput.checked,
          hashtags: hashtagsInput.value,
          supportThreadMk: supportThreadMkInput.checked,
          splitMode: getSplitModeValue(),
        });

        renderPosts(result.posts);
        setBanner(result.warning);
      } catch (error) {
        renderEmpty();
        setBanner(error.message);
      } finally {
        updateCorrectButtonState();
        updateTranslateButtonState();
        saveDraftState();
      }
    }

    function eventTargetsNode(event, node) {
      if (!node) {
        return false;
      }

      if (typeof event.composedPath === "function") {
        return event.composedPath().includes(node);
      }

      return node.contains(event.target);
    }

    function closeMenuOnOutsidePress(event) {
      if (moreMenu.open && !eventTargetsNode(event, moreMenu)) {
        moreMenu.open = false;
      }

      if (
        !hashtagsMenu.hidden &&
        !eventTargetsNode(event, hashtagsMenu) &&
        !eventTargetsNode(event, loadHashtagsButton)
      ) {
        closeHashtagsMenu();
      }

      if (
        !draftsMenu.hidden &&
        !eventTargetsNode(event, draftsMenu) &&
        !eventTargetsNode(event, loadDraftButton)
      ) {
        closeDraftsMenu();
      }
    }

    function syncMoreMenuState() {
      if (menuBackdrop) {
        menuBackdrop.hidden = !moreMenu.open;
      }
    }

    async function resolveSpellcheckLanguage(text) {
      const currentLanguage = interfaceLanguage === "es" ? "es" : "en";
      const suggested = detectSuggestedLanguage(text);

      if (!suggested.language || suggested.language === currentLanguage || suggested.confidence < 0.18) {
        return currentLanguage;
      }

      if (suggested.language === "es" && currentLanguage !== "es") {
        const shouldSwitchToSpanish = await openConfirmModal({
          message: uiText("spellcheckSwitchSpanish"),
          confirmLabel: uiText("yes"),
        });
        if (!shouldSwitchToSpanish) {
          return null;
        }

        applyInterfaceLanguage("es", { persist: true });
        render();
        return "es";
      }

      const continueWithCurrentLanguage = await openConfirmModal({
        message: uiText("spellcheckMismatchGeneric", {
          language: getLanguageLabel(currentLanguage, { locale: interfaceLanguage, capitalize: true }),
        }),
        confirmLabel: uiText("continue"),
      });

      return continueWithCurrentLanguage ? currentLanguage : null;
    }

    async function handleCorrection() {
      const rawText = getSourceText();
      if (!normalizeText(rawText)) {
        return;
      }

      moreMenu.open = false;

      const language = await resolveSpellcheckLanguage(rawText);
      if (!language) {
        return;
      }

      correctButton.disabled = true;
      compressButton.disabled = true;
      inlineSpellcheckButton.disabled = true;
      inlineCompressButton.disabled = true;
      const button = correctButton;
      const originalLabel = button.textContent;
      button.textContent = uiText("correctingText");
      setCorrectionStatus(uiText("correctingText"));

      try {
        const result = await correctTextContent(rawText, language);
        if (result.changes || result.ignoredRanges.length) {
          setSourceHtml(buildOutputHtml(result.original, result.edits, result.ignoredRanges));
        } else {
          setSourceText(result.corrected);
        }
        render();

        if (!result.changes && !result.ignoredRanges.length) {
          setCorrectionStatus(uiText("noChangesNeeded"));
        } else if (result.method === "languagetool") {
          const parts = [];
          if (result.changes) {
            parts.push(pluralText("correctedIssue", result.changes));
          }
          if (result.ignoredRanges.length) {
            parts.push(pluralText("flaggedTerm", result.ignoredRanges.length));
          }
          setCorrectionStatus(uiText("viaLanguageTool", { parts: parts.join(", ") }));
        } else {
          setCorrectionStatus(pluralText("fallbackFix", result.changes));
        }
      } catch (error) {
        setCorrectionStatus(uiText("correctionFailed"));
      } finally {
        button.textContent = originalLabel;
        updateCorrectButtonState();
      }
    }

    async function handleCompressText() {
      const rawText = getSourceText();
      const normalizedSourceText = normalizeText(rawText);
      if (
        !normalizedSourceText ||
        compressInFlight ||
        getGeneratedPostCount() < 2
      ) {
        return;
      }

      if (normalizedSourceText.length > MAX_COMPRESSION_SOURCE_CHARACTERS) {
        setBanner(
          uiText("compressionLimitReached", {
            count: MAX_COMPRESSION_SOURCE_CHARACTERS,
          }),
        );
        return;
      }

      moreMenu.open = false;
      compressInFlight = true;
      correctButton.disabled = true;
      compressButton.disabled = true;
      inlineSpellcheckButton.disabled = true;
      inlineCompressButton.disabled = true;
      const originalLabel = compressButton.textContent;
      compressButton.textContent = uiText("compressing");
      setCorrectionStatus(uiText("compressing"));

      try {
        const result = await compressTextContent(normalizedSourceText, {
          sourceLanguage: interfaceLanguage === "es" ? "es" : "en",
          compressionStrength: compressionStrengthSelect.value,
        });

        setSourceText(result.compressedText);
        render();
        focusSourceInput();

        if (result.compressedText === normalizedSourceText) {
          setCorrectionStatus(uiText("compressionNoChanges"));
        } else {
          setCorrectionStatus(
            uiText("compressedBy", {
              count: Math.max(0, normalizedSourceText.length - result.compressedText.length),
            }),
          );
        }
      } catch (error) {
        setCorrectionStatus(
          typeof error?.message === "string" && error.message.trim()
            ? error.message
            : uiText("compressionFailed"),
        );
      } finally {
        compressInFlight = false;
        compressButton.textContent = originalLabel;
        updateCorrectButtonState();
      }
    }

    async function handleTranslateThread() {
      if (!inlineTranslateButton) {
        return;
      }

      const rawText = getSourceText();
      const normalizedSourceText = normalizeText(rawText);
      if (
        !normalizedSourceText ||
        translateInFlight ||
        normalizedSourceText.length < MIN_TRANSLATION_SOURCE_CHARACTERS
      ) {
        return;
      }

      if (normalizedSourceText.length > MAX_TRANSLATION_SOURCE_CHARACTERS) {
        setBanner(
          uiText("translationLimitReached", {
            count: MAX_TRANSLATION_SOURCE_CHARACTERS,
          }),
        );
        return;
      }

      const sourceLanguage = interfaceLanguage === "es" ? "es" : "en";
      const targetLanguage = getOppositeLanguage(sourceLanguage);
      const originalLabel = getTranslateButtonLabel(targetLanguage);
      const loadingLabel = getTranslatingButtonLabel(targetLanguage);

      translateInFlight = true;
      inlineTranslateButton.disabled = true;
      inlineTranslateButton.textContent = loadingLabel;
      inlineTranslateButton.setAttribute("aria-label", loadingLabel);
      setBanner("");

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceText: normalizedSourceText,
            hashtags: normalizeHashtags(hashtagsInput.value || ""),
            sourceLanguage,
            targetLanguage,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || uiText("translationFailed"));
        }

        activeSavedDraftId = null;
        setSourceText(typeof payload?.translatedText === "string" ? payload.translatedText : "");
        hashtagsInput.value = normalizeHashtags(
          typeof payload?.translatedHashtags === "string" ? payload.translatedHashtags : "",
        );
        applyInterfaceLanguage(payload?.targetLanguage === "es" ? "es" : "en", {
          persist: true,
        });
        closeDraftsMenu();
        closeHashtagsMenu();
        render();
        focusSourceInput();
      } catch (error) {
        setBanner(
          typeof error?.message === "string" && error.message.trim()
            ? error.message
            : uiText("translationFailed"),
        );
      } finally {
        translateInFlight = false;
        inlineTranslateButton.textContent = originalLabel;
        inlineTranslateButton.setAttribute("aria-label", originalLabel);
        updateTranslateButtonState();
      }
    }

    async function handleClearCache() {
      const confirmed = await openConfirmModal({
        title: uiText("clearCache"),
        message: uiText("clearCacheWarning"),
        cancelLabel: uiText("cancel"),
        confirmLabel: uiText("clearCache"),
      });

      if (!confirmed) {
        return;
      }

      const originalLabel = clearCacheButton.textContent;
      clearCacheButton.disabled = true;
      clearCacheButton.textContent = uiText("clearingCache");

      try {
        try {
          window.localStorage.removeItem(THEME_STORAGE_KEY);
          window.localStorage.removeItem(COLOR_PRESET_STORAGE_KEY);
          window.localStorage.removeItem(TEXT_SIZE_STORAGE_KEY);
          window.localStorage.removeItem(UI_LANGUAGE_STORAGE_KEY);
          window.localStorage.removeItem(INTRO_DISMISSED_STORAGE_KEY);
          window.localStorage.removeItem(SAVED_DRAFTS_STORAGE_KEY);
          window.localStorage.removeItem(SAVED_HASHTAGS_STORAGE_KEY);
          window.localStorage.removeItem(getScopedStorageKey(SAVED_DRAFTS_STORAGE_KEY, "en"));
          window.localStorage.removeItem(getScopedStorageKey(SAVED_DRAFTS_STORAGE_KEY, "es"));
          window.localStorage.removeItem(getScopedStorageKey(SAVED_HASHTAGS_STORAGE_KEY, "en"));
          window.localStorage.removeItem(getScopedStorageKey(SAVED_HASHTAGS_STORAGE_KEY, "es"));
        } catch (error) {
          // Ignore storage failures and continue clearing what we can.
        }

        try {
          window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
          window.sessionStorage.removeItem(SUPPORT_PROMPT_COUNTER_STORAGE_KEY);
        } catch (error) {
          // Ignore storage failures and continue clearing what we can.
        }

        if (window.caches && typeof window.caches.keys === "function") {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        }

        window.location.reload();
      } catch (error) {
        clearCacheButton.disabled = false;
        clearCacheButton.textContent = originalLabel;
        setBanner(uiText("cacheClearFailed"));
      }
    }

    function handleSourcePaste(event) {
      const plainText = event.clipboardData?.getData("text/plain") || "";
      const htmlText = event.clipboardData?.getData("text/html") || "";

      if (!plainText && !htmlText) {
        return;
      }

      event.preventDefault();
      flattenSourceMarkupPreservingSelection();

      const normalizedPlain = normalizePlainPaste(plainText);
      const htmlParagraphText = htmlToRenderedParagraphText(htmlText);
      let preferred = normalizedPlain || normalizePastedText(plainText);

      if (htmlParagraphText) {
        const plainBlocks = preferred ? preferred.split(/\n\n/).length : 0;
        const htmlBlocks = htmlParagraphText.split(/\n\n/).length;
        if (!preferred || htmlBlocks > plainBlocks) {
          preferred = htmlParagraphText;
        }
      }

      insertTextAtCursor(preferred || normalizePastedText(plainText));
      trimLeadingDraftPadding();
      sourceInput.dispatchEvent(new Event("input", { bubbles: true }));
      setBanner("");
    }

    async function handlePasteFromClipboard() {
      pasteButton.disabled = true;
      pasteButtonLabel.textContent = uiText("paste");
      pasteButton.setAttribute("aria-label", uiText("pasting"));
      pasteButton.setAttribute("title", uiText("pasting"));

      try {
        if (!canUseClipboardRead()) {
          return;
        }

        const pastedText = await navigator.clipboard.readText();
        if (!pastedText) {
          setBanner(uiText("clipboardEmpty"));
          return;
        }

        flattenSourceMarkupPreservingSelection();
        insertTextAtCursor(normalizePlainPaste(pastedText) || normalizePastedText(pastedText));
        trimLeadingDraftPadding();
        sourceInput.dispatchEvent(new Event("input", { bubbles: true }));
        setBanner("");
        pasteButton.classList.add("pasted");
        pasteButtonLabel.textContent = uiText("paste");
        pasteButton.setAttribute("aria-label", uiText("pasted"));
        pasteButton.setAttribute("title", uiText("pasted"));
        window.setTimeout(() => {
          pasteButton.classList.remove("pasted");
          pasteButtonLabel.textContent = uiText("paste");
          pasteButton.setAttribute("aria-label", uiText("paste"));
          pasteButton.setAttribute("title", uiText("paste"));
        }, 1400);
      } catch (error) {
        return;
      } finally {
        window.setTimeout(() => {
          pasteButton.disabled = false;
          if (pasteButton.getAttribute("aria-label") !== uiText("pasted")) {
            pasteButtonLabel.textContent = uiText("paste");
            pasteButton.setAttribute("aria-label", uiText("paste"));
            pasteButton.setAttribute("title", uiText("paste"));
          }
        }, 0);
      }
    }

    function handleClearSource() {
      activeSavedDraftId = null;
      setSourceText("");
      hashtagsInput.value = "";
      setBanner("");
      closeDraftsMenu();
      render();

      if (!hashtagsMenu.hidden) {
        renderHashtagMenu();
      }

      focusSourceInput();
    }

    function handleNewDraft() {
      handleClearSource();

      if (supportThreadMkInput.checked || supportPromptCounter < SUPPORT_PROMPT_TRIGGER_COUNT) {
        return;
      }

      clearSupportPromptTimeout();
      supportPromptTimeoutId = window.setTimeout(() => {
        supportPromptTimeoutId = null;

        if (supportThreadMkInput.checked || supportPromptCounter < SUPPORT_PROMPT_TRIGGER_COUNT) {
          return;
        }

        showSupportPromptModal();
        setSupportPromptCounter(0);
      }, SUPPORT_PROMPT_DELAY_MS);
    }

    function flashSaveDraftButtonLabel() {
      if (saveDraftFeedbackTimeoutId) {
        window.clearTimeout(saveDraftFeedbackTimeoutId);
      }

      saveDraftButton.textContent = uiText("savedDraft");
      saveDraftFeedbackTimeoutId = window.setTimeout(() => {
        saveDraftFeedbackTimeoutId = null;
        saveDraftButton.textContent = uiText("saveDraft");
      }, 1000);
    }

    function handleSaveDraft() {
      const draft = getCurrentDraftPayload();
      if (!normalizeText(draft.sourceText) && !draft.hashtags) {
        return;
      }

      const savedDrafts = loadSavedDrafts();
      const activeIndex =
        activeSavedDraftId
          ? savedDrafts.findIndex((entry) => entry.id === activeSavedDraftId)
          : -1;
      const existingIndex = savedDrafts.findIndex(
        (entry) => entry.sourceText === draft.sourceText && entry.hashtags === draft.hashtags,
      );
      const targetIndex = activeIndex >= 0 ? activeIndex : existingIndex;
      const existingDraft = targetIndex >= 0 ? savedDrafts[targetIndex] : null;
      const shouldPreservePosted =
        Boolean(existingDraft) &&
        existingDraft.sourceText === draft.sourceText &&
        existingDraft.hashtags === draft.hashtags;
      const nextDraft = {
        id:
          targetIndex >= 0
            ? savedDrafts[targetIndex].id
            : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sourceText: draft.sourceText,
        hashtags: draft.hashtags,
        savedAt: Date.now(),
        posted: shouldPreservePosted ? Boolean(existingDraft.posted) : false,
      };
      const nextDrafts =
        targetIndex >= 0
          ? [nextDraft, ...savedDrafts.filter((_, index) => index !== targetIndex)]
          : [nextDraft, ...savedDrafts];

      saveSavedDrafts(nextDrafts);
      activeSavedDraftId = nextDraft.id;
      flashSaveDraftButtonLabel();
      handleNewDraft();
    }

    function loadDraftIntoComposer(draftId) {
      const draft = loadSavedDrafts().find((entry) => entry.id === draftId);
      if (!draft) {
        renderDraftMenu();
        return;
      }

      activeSavedDraftId = draft.id;
      setSourceText(draft.sourceText);
      hashtagsInput.value = draft.hashtags;
      setBanner("");
      closeDraftsMenu();
      render();
      focusSourceInput();
    }

    function handleHashtagsInput() {
      render();

      if (!hashtagsMenu.hidden) {
        renderHashtagMenu();
      }
    }

    function handleSaveHashtags() {
      const currentTokens = getHashtagTokens();
      if (!currentTokens.length) {
        return;
      }

      hashtagsInput.value = currentTokens.join(" ");
      const saved = loadSavedHashtags();
      saveSavedHashtags([...saved, ...currentTokens]);

      render();

      if (!hashtagsMenu.hidden) {
        renderHashtagMenu();
      } else {
        updateHashtagButtonsState();
      }
    }

    function handleHashtagMenuChange(event) {
      const checkbox = event.target.closest(".hashtags-menu-checkbox");
      if (!checkbox) {
        return;
      }

      const presetValue = decodeURIComponent(checkbox.dataset.value || "");
      const currentTokens = getHashtagTokens();
      let nextTokens = currentTokens.slice();

      if (checkbox.checked) {
        const existing = new Set(nextTokens);
        if (!existing.has(presetValue)) {
          nextTokens.push(presetValue);
        }
      } else {
        nextTokens = nextTokens.filter((token) => token !== presetValue);
      }

      hashtagsInput.value = nextTokens.join(" ");
      render();
      renderHashtagMenu();
    }

    function handleHashtagMenuClick(event) {
      const deleteButton = event.target.closest(".hashtags-menu-delete-button");
      if (!deleteButton) {
        return;
      }

      const presetValue = decodeURIComponent(deleteButton.dataset.deleteValue || "");
      saveSavedHashtags(loadSavedHashtags().filter((value) => value !== presetValue));
      renderHashtagMenu();
    }

    function handleDraftMenuClick(event) {
      const deleteButton = event.target.closest(".drafts-menu-delete-button");
      if (deleteButton) {
        const draftId = decodeURIComponent(deleteButton.dataset.deleteDraftId || "");
        if (draftId && draftId === activeSavedDraftId) {
          activeSavedDraftId = null;
        }
        saveSavedDrafts(loadSavedDrafts().filter((entry) => entry.id !== draftId));
        renderDraftMenu();
        return;
      }

      const selectButton = event.target.closest(".drafts-menu-select-button");
      if (!selectButton) {
        return;
      }

      const draftId = decodeURIComponent(selectButton.dataset.draftId || "");
      loadDraftIntoComposer(draftId);
    }

    function handleSourceInput(event) {
      if (sourceMarkupActive) {
        flattenSourceMarkupPreservingSelection();
      }

      const currentText = getSourceText();
      if (!currentText) {
        setSourceText("");
      }

      render();
    }

    function handleSourceClick(event) {
      const target = event.target.closest(".change, .reverted");
      if (!target || !sourceInput.contains(target)) {
        return;
      }

      event.preventDefault();
      const original = decodeURIComponent(target.dataset.original || "");
      if (!original) {
        return;
      }

      if (target.classList.contains("change")) {
        toggleAllMatches(original, "reverted");
        addIgnoredCorrection(original, selectedLanguage);
      } else {
        toggleAllMatches(original, "change");
        removeIgnoredCorrection(original, selectedLanguage);
      }

      render();
    }

    form.addEventListener("input", render);
    sourceInput.addEventListener("input", handleSourceInput);
    sourceInput.addEventListener("click", handleSourceClick);
    sourceInput.addEventListener("paste", handleSourcePaste);
    inlineSpellcheckButton.addEventListener("click", handleCorrection);
    inlineCompressButton.addEventListener("click", handleCompressText);
    inlineTranslateButton.addEventListener("click", handleTranslateThread);
    hashtagsInput.addEventListener("input", handleHashtagsInput);
    platformLimit.addEventListener("change", render);
    customLimit.addEventListener("input", render);
    preserveLineBreaksInput.addEventListener("change", render);
    languageSelect.addEventListener("change", () => {
      applyInterfaceLanguage(languageSelect.value, { persist: true });
      render();
      moreMenu.open = false;
    });
    pasteButton.addEventListener("click", handlePasteFromClipboard);
    dismissIntroButton.addEventListener("click", () => {
      applyIntroVisibility(true, { persist: true });
    });
    newDraftButton.addEventListener("click", handleNewDraft);
    saveDraftButton.addEventListener("click", handleSaveDraft);
    loadDraftButton.addEventListener("click", handleLoadDraftsClick);
    saveHashtagsButton.addEventListener("click", handleSaveHashtags);
    loadHashtagsButton.addEventListener("click", handleLoadHashtagsClick);
    confirmModalCancelButton.addEventListener("click", () => closeConfirmModal(false));
    confirmModalConfirmButton.addEventListener("click", () => closeConfirmModal(true));
    confirmModal.addEventListener("click", (event) => {
      if (event.target === confirmModal) {
        closeConfirmModal(false);
      }
    });
    supportPromptOkButton.addEventListener("click", closeSupportPromptModal);
    supportPromptModal.addEventListener("click", (event) => {
      if (event.target === supportPromptModal) {
        closeSupportPromptModal();
      }
    });
    supportPromptEnableInput.addEventListener("change", () => {
      supportThreadMkInput.checked = supportPromptEnableInput.checked;
      supportThreadMkInput.dispatchEvent(new Event("change", { bubbles: true }));
      render();
    });
    draftsMenuList.addEventListener("click", handleDraftMenuClick);
    hashtagsMenuList.addEventListener("change", handleHashtagMenuChange);
    hashtagsMenuList.addEventListener("click", handleHashtagMenuClick);
    moreMenu.addEventListener("toggle", syncMoreMenuState);
    if (menuBackdrop) {
      menuBackdrop.addEventListener("click", () => {
        moreMenu.open = false;
      });
    }
    clearCacheButton.addEventListener("click", handleClearCache);
    paletteSelect.addEventListener("change", () => {
      applyColorPreset(paletteSelect.value);
      moreMenu.open = false;
    });
    largeTextToggle.addEventListener("change", () => {
      applyTextSize(largeTextToggle.checked ? "large" : "normal");
      moreMenu.open = false;
    });
    supportThreadMkInput.addEventListener("change", () => {
      if (supportThreadMkInput.checked) {
        clearSupportPromptTimeout();
        setSupportPromptCounter(0);
      }
    });
    if (window.PointerEvent) {
      document.addEventListener("pointerdown", closeMenuOnOutsidePress, true);
    } else {
      document.addEventListener("mousedown", closeMenuOnOutsidePress, true);
      document.addEventListener("touchstart", closeMenuOnOutsidePress, {
        capture: true,
        passive: true,
      });
    }
    window.addEventListener("resize", () => {
      syncHashtagsMenuSize();
      syncDraftsMenuSize();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!confirmModal.hidden) {
          closeConfirmModal(false);
          return;
        }

        if (supportPromptModal && !supportPromptModal.hidden) {
          closeSupportPromptModal();
          return;
        }

        if (moreMenu.open) {
          moreMenu.open = false;
        }

        if (!hashtagsMenu.hidden) {
          closeHashtagsMenu();
        }

        if (!draftsMenu.hidden) {
          closeDraftsMenu();
        }
      }
    });

    const initialBrowserLanguage = detectBrowserLanguage();

    applyColorPreset(loadColorPresetPreference());
    applyTextSize(loadTextSizePreference());
    applyIntroVisibility(loadIntroDismissedPreference());
    applyInterfaceLanguage(loadInterfaceLanguagePreference() || initialBrowserLanguage || "en");
    syncMoreMenuState();
    restoreDraftState();
    supportPromptCounter = loadSupportPromptCounter();
    if (supportThreadMkInput.checked) {
      setSupportPromptCounter(0);
    }
    render();
  }

  if (typeof window !== "undefined") {
    window.ThreadMK = {
      buildThread,
      compressTextContent,
      correctTextContent,
      detectSuggestedLanguage,
      normalizeHashtags,
      renderPostHtml,
    };

    if (typeof document !== "undefined") {
      document.addEventListener("DOMContentLoaded", initApp);
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      applySimpleCorrections,
      buildThread,
      compressTextContent,
      correctTextContent,
      detectSuggestedLanguage,
      normalizeHashtags,
      renderPostHtml,
      takeChunk,
    };
  }
})();
