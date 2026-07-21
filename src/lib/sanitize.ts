import sanitizeHtml from "sanitize-html";

// Only allow embeds from these hosts.
const allowedIframeHostnames = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

/**
 * Sanitize rich-text HTML produced by the editor before it is stored and
 * before it is rendered. This is the primary defense against stored XSS.
 */
export function sanitize(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "ul", "ol", "li", "blockquote",
      "b", "i", "strong", "em", "u", "s", "del", "mark", "sup", "sub",
      "code", "pre", "br", "hr", "span", "div",
      "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "td", "th", "caption", "colgroup", "col",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title", "loading"],
      code: ["class"],
      pre: ["class"],
      span: ["class", "style"],
      p: ["style"],
      h1: ["id", "style"],
      h2: ["id", "style"],
      h3: ["id", "style"],
      td: ["colspan", "rowspan", "style"],
      th: ["colspan", "rowspan", "scope", "style"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowedIframeHostnames,
    allowIframeRelativeUrls: false,
    // Restrict inline styles to text alignment only (used by the editor).
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    allowedClasses: {
      code: [/^language-[a-z0-9-]+$/i, "hljs"],
      span: ["hljs", /^hljs-/],
      pre: ["hljs"],
    },
    transformTags: {
      // Harden every anchor against tab-nabbing.
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}
