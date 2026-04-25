import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes author-generated HTML for safe rendering with dangerouslySetInnerHTML.
 * Allows standard rich-text tags but strips all scripts, event handlers, iframes,
 * and any other vectors that could execute JavaScript.
 */
export function sanitize(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "strike",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Force external links to open safely
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.href?.startsWith("http") && {
            target: "_blank",
            rel: "noopener noreferrer",
          }),
        },
      }),
    },
  });
}
