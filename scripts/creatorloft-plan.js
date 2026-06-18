const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, TableOfContents, Header, Footer, PageNumber,
} = require(path.join("C:\\Users\\andyb\\AppData\\Roaming\\npm\\node_modules", "docx"));

const ACCENT = "6D28D9"; // purple-ish, matches AuthorLoft branding
const LIGHT = "F3E8FF";
const GREY = "6B7280";

const border = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, ...opts })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 60 },
    children: Array.isArray(text) ? text : [new TextRun(text)],
  });
}
function boldBullet(label, rest, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun(rest),
    ],
  });
}
function num(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 60 },
    children: [new TextRun(text)],
  });
}

function headerCell(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: ACCENT, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
  });
}
function cell(text, width, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: !!opts.bold })] })],
  });
}

// ── Feature mapping table ───────────────────────────────────────────────────
const featureRows = [
  ["AuthorLoft today", "CreatorLoft (generalized)", "Notes"],
  ["Author profile / public author page", "Creator profile (Author / Musician / Artist / ...)",
    "Add a `creatorType` field; profile templates vary by type"],
  ["Book catalog (title, cover, formats: ebook/print/audio)", "Work catalog (Book, Album/Track, Artwork/Print, Course, ...)",
    "Generalize `Book` model to `Work` with a `workType` discriminator + type-specific metadata (JSON)"],
  ["Bookstore (/bookstore discovery)", "Creator Marketplace (/marketplace) with vertical sections",
    "Bookstore becomes one filter/section of a unified marketplace"],
  ["Flip-book / ebook reader", "Media preview players (ebook reader, audio player, image lightbox, video embed)",
    "Pluggable \"preview\" component per work type"],
  ["File upload: book covers, ebook/PDF files", "File upload: covers/art, audio masters, image galleries, video",
    "Reuse Supabase Storage; add buckets per media type + size/type validation"],
  ["Cart + checkout (ebook/print/audio formats)", "Cart + checkout (any sellable work: book, track, album, print, digital art)",
    "Cart/Order models already format-agnostic; extend `Format` enum"],
  ["Author site (branding, bio, links)", "Creator site / brand page (theme, bio, links, custom domain)",
    "Theming becomes more configurable (color, layout templates per vertical)"],
  ["Newsletter / mailing list", "Fan list / audience capture", "No structural change - rename in UI copy only"],
  ["Pre-orders, affiliate links, media kit (Author Empowerment)", "Pre-orders / drops, affiliate links, press kit for any creator",
    "Same backend, generalized labels and templates"],
  ["Super Admin (plans, coupons, SEO, content)", "Super Admin (unchanged) + creator-type management",
    "Add creator-type config and per-vertical feature gates"],
  ["Stripe billing / plan tiers", "Stripe billing / plan tiers (unchanged)", "Tier limits may vary slightly by vertical (e.g., storage caps for audio/video)"],
];

function buildTable(rows, widths) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({
        children: r.map((c, j) => i === 0 ? headerCell(c, widths[j]) : cell(c, widths[j], { fill: i % 2 === 0 ? "F9FAFB" : undefined })),
      })
    ),
  });
}

// ── Roadmap table ────────────────────────────────────────────────────────────
const roadmapRows = [
  ["Phase", "Focus", "Key deliverables", "Est. effort"],
  ["Phase 0\nFoundations", "Data model & naming groundwork", "Generalize Author -> Creator (alias, no breaking renames yet); add creatorType + Work model alongside Book; feature flags per creator type", "2-3 weeks"],
  ["Phase 1\nMusicians (pilot vertical)", "Prove the model with one new vertical", "Audio upload + player; Track/Album metadata; music storefront section; streaming links (Spotify/Apple/Bandcamp); waveform preview", "4-6 weeks"],
  ["Phase 2\nVisual Artists", "Image-first vertical", "Gallery layouts; high-res image upload + zoom/lightbox; print-on-demand link-outs; commission request form", "3-5 weeks"],
  ["Phase 3\nUnified Marketplace & Branding", "Tie verticals together", "/marketplace replaces/extends /bookstore with type filters; creator site themes per vertical; unified search across work types", "4-6 weeks"],
  ["Phase 4\nCreatorLoft rebrand (optional)", "Brand-level decision", "New domain/brand option (e.g. creatorloft.com) as an umbrella, OR keep AuthorLoft brand and add verticals under it; migration plan for existing authors/customers", "Decision + 2-4 weeks if pursued"],
  ["Phase 5\nGrowth modules", "Expand audience tools per vertical", "Podcaster/video creator support; course/digital-product sales; cross-creator collabs & bundles; creator analytics dashboard", "Ongoing"],
];

// ── Risks table ─────────────────────────────────────────────────────────────
const riskRows = [
  ["Risk / Open question", "Why it matters", "Mitigation"],
  ["Brand dilution: \"AuthorLoft\" name implies books only", "New verticals may feel bolted-on if branding still says \"Author\"",
    "Start with in-product generalization (\"Creator\") while keeping AuthorLoft as the company brand; revisit a CreatorLoft umbrella brand once 2+ verticals are proven"],
  ["Storage & bandwidth costs for audio/video/large images", "Music and video files are much larger than ebooks/PDFs",
    "Add per-tier storage caps; consider a paid add-on for extra storage; use Supabase Storage CDN + compression"],
  ["Feature parity expectations", "Musicians/artists will expect features common in Bandcamp/Etsy (streaming, prints, shipping)",
    "Phase rollout - ship a focused MVP per vertical, not full parity on day one; lean on external links (Spotify, print-on-demand partners) first"],
  ["Database migration risk on `Book` -> `Work`", "Existing book data and relations (orders, cart, formats) must not break",
    "Additive approach: introduce `Work` as a new model that supersedes `Book` long-term, or add `workType`/JSON metadata to existing model rather than a risky rename"],
  ["Pricing tier complexity", "Different verticals may need different limits (storage, formats, AI usage)",
    "Keep FREE/STANDARD/PREMIUM structure; add vertical-specific limits as metadata on the plan, not new tiers"],
  ["Support & onboarding load", "New creator types = new questions, new content guidelines, new FAQs",
    "Reuse existing FAQ/Resources/Support-email systems; add vertical-specific onboarding flows and templates"],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F2937" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Arial", color: "374151" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ],
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "AuthorLoft -> CreatorLoft  |  Strategic Expansion Plan", size: 16, color: GREY })],
        }),
      ]}),
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })],
        }),
      ]}),
    },
    children: [
      // ── Title page ─────────────────────────────────────────────────────
      new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "CreatorLoft", bold: true, size: 64, color: ACCENT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "A Strategic Plan for Expanding AuthorLoft into a Multi-Creator Platform", size: 28, color: "374151" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 },
        children: [new TextRun({ text: "Authors  -  Indie Musicians  -  Visual Artists  -  and beyond", size: 22, italics: true, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
        children: [new TextRun({ text: "Prepared for review and consideration  |  June 2026", size: 20, color: GREY })] }),
      new Paragraph({ children: [new PageBreak()] }),

      new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── Executive Summary ────────────────────────────────────────────────
      h1("1. Executive Summary"),
      p("AuthorLoft has proven a model that works for independent authors: a self-serve platform that combines a personal storefront, a discovery catalog (the Bookstore), direct sales (ebook, print, audio), marketing tools (newsletters, pre-orders, affiliate links), and a Super Admin layer for platform operations. “CreatorLoft” is the natural next step - taking the same proven scaffolding and opening it to other independent creators: musicians selling tracks and albums, and visual artists selling prints, originals, and digital downloads."),
      p("This plan is intentionally additive and low-risk: it does not propose rebuilding AuthorLoft, but extending its data model, storefront, and admin tooling so a single platform can serve multiple creator types - while every feature that currently works for authors keeps working exactly as it does today."),
      h2("Guiding Principles"),
      bullet("Reuse, don't rebuild. The plan, billing, admin, email, and storefront infrastructure already exists - new verticals plug into it."),
      bullet("Additive data model changes only. New tables/fields, no destructive renames; existing Book/Author data stays intact."),
      bullet("One vertical at a time. Prove the model with Musicians before adding Visual Artists, so each phase de-risks the next."),
      bullet("Brand decision deferred. Whether the company becomes “CreatorLoft”, adds a sub-brand, or stays “AuthorLoft” with new categories is a marketing decision made after the first new vertical ships and gets feedback."),

      // ── Vision ────────────────────────────────────────────────────────────
      h1("2. Vision & Positioning"),
      p("Today, AuthorLoft's pitch is: “Everything an independent author needs to publish, sell, and grow - in one place.” CreatorLoft extends that promise to any independent creator with something to sell directly to fans:"),
      boldBullet("Authors ", "- ebooks, print books, audiobooks (already live)."),
      boldBullet("Indie Musicians ", "- singles, albums, merch bundles, with links out to streaming platforms."),
      boldBullet("Visual Artists & Photographers ", "- digital downloads, prints, originals, commission requests."),
      boldBullet("Future verticals ", "- podcasters, course creators, filmmakers/animators, designers - same scaffolding, new “work types”."),
      p("The core promise stays the same across verticals: a creator gets a branded storefront, a way to sell their work directly (keeping more of the revenue than marketplaces like Etsy/Bandcamp/Amazon take), built-in marketing tools, and zero need to manage hosting, payments infrastructure, or technical setup."),

      // ── Market opportunity ───────────────────────────────────────────────
      h1("3. Market Opportunity"),
      p("Independent creators across media types face the same core problem: large marketplaces (Amazon, Spotify, Etsy, Instagram) take a cut, control the relationship with the fan, and bury creators in algorithmic feeds. A growing number of creators want a direct-to-fan storefront with their own brand - the same need AuthorLoft already meets for authors."),
      bullet("Indie music: platforms like Bandcamp prove demand for direct sales with fan-friendly pricing, but lack the broader site/brand/marketing toolkit AuthorLoft already has."),
      bullet("Visual artists: many sell through a patchwork of Etsy, Instagram, and print-on-demand services with no unified “home base” or mailing list ownership."),
      bullet("Cross-sell within AuthorLoft's existing base: some authors are also musicians (audiobook narrators, songwriters) or visual artists (illustrators, cover designers) - a multi-vertical platform increases stickiness for existing customers too."),

      // ── Creator verticals ─────────────────────────────────────────────────
      h1("4. Target Creator Verticals"),
      h2("4.1 Authors (existing - no change required)"),
      p("All current AuthorLoft functionality remains exactly as-is: book catalog, formats (ebook/print/audio), Bookstore discovery, flip-book preview, pre-orders, affiliate links, media kits, newsletters."),
      h2("4.2 Indie Musicians (Phase 1 - recommended pilot)"),
      bullet("Upload tracks and albums (audio files + cover art)."),
      bullet("Sell digital downloads (single track, full album, lossless/standard formats) and optional physical media (vinyl/CD) using the existing print/shipping patterns from books."),
      bullet("Embed an audio player with waveform preview on the creator's storefront and in the marketplace."),
      bullet("Link out to streaming platforms (Spotify, Apple Music, Bandcamp, SoundCloud) - read-only links, no streaming licensing complexity."),
      bullet("Reuse newsletter, pre-order (“drop”), and affiliate tools for album launches."),
      h2("4.3 Visual Artists & Photographers (Phase 2)"),
      bullet("Upload high-resolution images for galleries (with zoom/lightbox preview)."),
      bullet("Sell digital downloads (wallpapers, stock images, design files) directly."),
      bullet("Link out to print-on-demand partners (e.g., Printful, Society6) for physical prints - avoids AuthorLoft needing to handle printing/shipping logistics."),
      bullet("Simple commission-request form (fan submits a request, creator follows up by email)."),
      h2("4.4 Future Verticals (Phase 5+, directional only)"),
      bullet("Podcasters: episode feed, RSS export, premium/bonus episode sales."),
      bullet("Course creators: multi-file digital products (video + PDF bundles), reusing the existing digital-download cart flow."),
      bullet("Designers/illustrators: similar to visual artists, with template/asset-pack sales."),

      // ── Architecture ──────────────────────────────────────────────────────
      h1("5. Platform Architecture: From “Author” to “Creator”"),
      h2("5.1 Generalizing the Core Entities"),
      p("The least risky path is to keep the existing Prisma models (Author, Book, Order, Plan, etc.) intact, and layer generalization on top via new optional fields and new models - the same additive pattern already used for assignedCouponId and SeoConfig."),
      boldBullet("Author model ", "gains an optional `creatorType` field (e.g., \"author\" | \"musician\" | \"artist\"), defaulting to \"author\" for all existing records. UI labels (“Author dashboard”, “Your books”) become dynamic based on this field."),
      boldBullet("Book model -> Work model (additive) ", "rather than renaming Book, introduce a new `Work` model (or add a `workType` + flexible JSON `metadata` column to Book) so tracks, albums, and artwork can be stored alongside books without breaking existing Book relations to Order, Cart, and Format."),
      boldBullet("Format / Order / Cart models ", "already store sellable items generically (price, format, quantity) - these need minimal changes, mainly extending enums (e.g., Format: EBOOK | PRINT | AUDIO | DIGITAL_TRACK | DIGITAL_ALBUM | PRINT_ART | DIGITAL_ART)."),
      boldBullet("Storage buckets ", "extend the existing Supabase Storage pattern (`uploadToSupabaseStorage(bucket, key, buffer, mimeType)`) with new buckets: `audio-tracks`, `artwork`, with size/type validation per creator type."),
      h2("5.2 Feature Gating & Super Admin"),
      bullet("Plan tiers (FREE / STANDARD / PREMIUM) stay the same structure; add per-creator-type limits where needed (e.g., audio storage cap on STANDARD)."),
      bullet("Super Admin gains a small “Creator Types” config screen (enable/disable verticals platform-wide, similar to the existing Maintenance/Configuration tabs)."),
      bullet("Existing Super Admin tools - Coupons, SEO/Social Images, Testimonials, FAQs, Mass Email - all work unchanged across verticals since they operate on Author/platform level, not book-specific data."),

      // ── Feature mapping table ────────────────────────────────────────────
      h1("6. Feature Mapping: AuthorLoft Today -> CreatorLoft"),
      p("This table shows how every major existing feature maps onto the generalized platform. Nothing in the left column is removed - the middle column describes the generalized version."),
      buildTable(featureRows, [2700, 3300, 3360]),

      new Paragraph({ children: [new PageBreak()] }),

      // ── Storefront / branding ────────────────────────────────────────────
      h1("7. Storefront, Branding & Website Builder"),
      p("AuthorLoft authors already get a branded public page (bio, links, catalog). CreatorLoft extends this into a lightweight “brand site” per creator:"),
      bullet("Theme presets per creator type (e.g., a music-forward dark theme with large cover art and embedded players vs. a gallery-forward theme for visual artists vs. the current book-forward author theme)."),
      bullet("Each creator picks a theme preset and customizes colors/links - no freeform page builder needed initially, which keeps scope manageable."),
      bullet("Custom domain support (already on the roadmap/feature matrix for authors) extends naturally to all creator types."),
      bullet("The unified Marketplace (/marketplace) becomes a superset of today's /bookstore, with type filters (Books / Music / Art) so each vertical also gets cross-creator discovery."),

      // ── Database migration strategy ──────────────────────────────────────
      h1("8. Database & Technical Migration Strategy"),
      num("Add `creatorType` (nullable, default \"author\") to the Author model - zero impact on existing data."),
      num("Add a new `Work` model (or `workType` + `metadata` JSON on Book) for non-book items - existing Book rows untouched."),
      num("Extend the `Format` enum with music/art-specific values."),
      num("Add new Supabase Storage buckets with GRANT statements, following the existing pattern documented for all 41 tables."),
      num("Apply all schema changes via Supabase MCP migrations before each phase ships (per existing workflow - migrations are not auto-applied on deploy)."),
      num("Feature-flag each vertical so it can be enabled for a small beta group before general availability."),

      // ── Pricing ───────────────────────────────────────────────────────────
      h1("9. Pricing Tier Implications"),
      p("The existing FREE / STANDARD / PREMIUM structure (see Feature Matrix) is preserved. Recommended approach:"),
      bullet("New creator types are available on the same tiers as today - no new pricing tiers needed at launch."),
      bullet("Storage-heavy formats (audio, high-res images) may need tier-specific caps, similar to how AI usage caps already vary by plan."),
      bullet("Early-bird and assigned-coupon systems (already built) apply platform-wide, so promotional pricing for new-vertical creators reuses existing tooling."),

      // ── Roadmap ───────────────────────────────────────────────────────────
      h1("10. Phased Roadmap"),
      buildTable(roadmapRows, [1600, 1900, 4300, 1560]),

      new Paragraph({ children: [new PageBreak()] }),

      // ── Risks ─────────────────────────────────────────────────────────────
      h1("11. Risks & Open Questions"),
      buildTable(riskRows, [2700, 3000, 3660]),

      // ── Success metrics ───────────────────────────────────────────────────
      h1("12. Success Metrics (Phase 1 - Musicians pilot)"),
      bullet("Number of musician sign-ups within first 60 days of launch."),
      bullet("Number of tracks/albums uploaded and at least one sale completed."),
      bullet("Existing author retention unaffected (no regression in author-side metrics)."),
      bullet("Qualitative feedback from pilot musicians on missing must-have features before Phase 2 (Visual Artists) begins."),

      // ── Branding appendix ─────────────────────────────────────────────────
      h1("13. Appendix: Branding Considerations"),
      p("Three branding paths, to be decided after the Phase 1 pilot:"),
      boldBullet("Option A - Keep “AuthorLoft”, add categories. ", "Lowest risk, no domain/identity change. Marketing positions AuthorLoft as “for independent creators” with author-focused messaging gradually broadening."),
      boldBullet("Option B - “CreatorLoft” as a new umbrella brand. ", "AuthorLoft becomes the “books” product line under a new CreatorLoft parent brand alongside a future “MusicLoft”/“ArtLoft”-style identity for other verticals - higher effort, clearer long-term positioning."),
      boldBullet("Option C - Rename to “CreatorLoft” outright. ", "Single brand, single domain, all verticals under one name from the start. Requires domain acquisition, redirect/SEO migration plan (sitemap, OG images, existing SEO work would need to move), and customer communication - highest effort, but simplest end state."),
      p("Recommendation: ship Phase 1 (Musicians) under Option A with no branding change, gather real usage data, then revisit the branding decision with evidence instead of speculation."),
    ],
  }],
});

const outPath = path.join("C:\\Users\\andyb\\Downloads", "CreatorLoft_Expansion_Plan.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("Written:", outPath);
});
