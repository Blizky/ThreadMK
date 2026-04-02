const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const MAX_SOURCE_CHARACTERS = 2500;
const SUPPORTED_LANGUAGES = new Set(["en", "es"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=UTF-8",
    },
  });
}

function normalizeLanguage(language) {
  return language === "es" ? "es" : "en";
}

function normalizeCompressionStrength(value) {
  return value === "medium" || value === "heavy" ? value : "soft";
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function getLanguageLabel(language) {
  return language === "es" ? "Spanish" : "English";
}

function getStrengthInstructions(strength) {
  switch (strength) {
    case "heavy":
      return [
        "Shorten aggressively.",
        "Rewrite freely for brevity while preserving the core meaning and tone.",
        "Drop non-essential filler and repetition whenever possible.",
      ].join(" ");
    case "medium":
      return [
        "Make the text noticeably shorter.",
        "Use shorter equivalents, trim filler, and do light sentence rewording or merging.",
        "Keep the original tone and intent intact.",
      ].join(" ");
    default:
      return [
        "Make the text only a little shorter.",
        "Prefer shorter wording, light trimming, and minimal rephrasing.",
        "Keep the original structure and tone as much as possible.",
      ].join(" ");
  }
}

function extractGeneratedText(response) {
  if (typeof response === "string") {
    return response;
  }

  if (typeof response?.response === "string") {
    return response.response;
  }

  if (typeof response?.result?.response === "string") {
    return response.result.response;
  }

  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  return "";
}

function sanitizeGeneratedText(value) {
  let text = String(value || "").trim();

  text = text.replace(/^```[\w-]*\n?/u, "").replace(/\n?```$/u, "").trim();
  text = text.replace(
    /^(?:compressed text|rewritten text|shortened text|texto comprimido|texto reescrito)\s*:\s*/iu,
    "",
  );

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }

  return normalizeText(text);
}

async function runCompression(env, sourceText, sourceLanguage, compressionStrength) {
  const messages = [
    {
      role: "system",
      content: [
        "You compress social media posts.",
        `Always reply in ${getLanguageLabel(sourceLanguage)}.`,
        "Return only the rewritten post text.",
        "Do not add commentary, bullets, labels, or surrounding quotes.",
        "Preserve hashtags, @mentions, cashtags, links, and emojis exactly when they appear.",
        "Do not invent facts.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        `Compression level: ${compressionStrength}.`,
        getStrengthInstructions(compressionStrength),
        "Preserve paragraph breaks when reasonable.",
        "If the text is already concise, return it with only the smallest safe edits.",
        "",
        "Text:",
        sourceText,
      ].join("\n"),
    },
  ];

  const response = await env.AI.run(MODEL, { messages });
  const compressedText = sanitizeGeneratedText(extractGeneratedText(response));

  if (!compressedText) {
    throw new Error("Compression service returned an empty response.");
  }

  return compressedText;
}

export async function onRequestPost(context) {
  if (!context.env?.AI || typeof context.env.AI.run !== "function") {
    return json({ error: "Workers AI binding is not configured." }, 500);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch (error) {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  const sourceLanguage = normalizeLanguage(payload?.sourceLanguage);
  const compressionStrength = normalizeCompressionStrength(payload?.compressionStrength);
  const sourceText = normalizeText(payload?.sourceText);

  if (!SUPPORTED_LANGUAGES.has(sourceLanguage)) {
    return json({ error: "Only English and Spanish are supported." }, 400);
  }

  if (!sourceText) {
    return json({ error: "Source text is required." }, 400);
  }

  if (sourceText.length > MAX_SOURCE_CHARACTERS) {
    return json(
      {
        error: `Compression currently supports up to ${MAX_SOURCE_CHARACTERS} characters in the source text.`,
      },
      400,
    );
  }

  try {
    const compressedText = await runCompression(
      context.env,
      sourceText,
      sourceLanguage,
      compressionStrength,
    );

    return json({
      compressedText,
      sourceLanguage,
      compressionStrength,
    });
  } catch (error) {
    return json(
      {
        error:
          typeof error?.message === "string" && error.message.trim()
            ? error.message
            : "Compression failed.",
      },
      502,
    );
  }
}
