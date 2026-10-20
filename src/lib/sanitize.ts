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
      "strong", "b", "em", "i", "u", "s", "strike", "mark",
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
      "*": ["class", "style"],
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

/**
 * Sanitizes article body HTML and demotes any <h1> inside it to <h2>: the page template already renders
 * the title as the one H1, and editor-authored bodies often carry their own H1s.
 */
export function sanitizeArticle(html: string | null | undefined): string {
  return sanitize(html).replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>");
}
