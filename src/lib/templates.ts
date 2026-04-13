// AuthorLoft Home Page Templates
// Each template defines a unique layout/style for the author's public homepage.

export type TemplateId = "classic" | "minimal" | "bold";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  heroStyle: string;
  typographyNote: string;
  colorNote: string;
  layoutNote: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    description: "A timeless layout with a coloured hero banner, author bio, and book list. Great for any genre.",
    heroStyle: "Coloured banner with book covers",
    typographyNote: "Clean sans-serif headings",
    colorNote: "Accent colour fills the hero banner",
    layoutNote: "Hero → Bio → Books → Series → Newsletter",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "A clean, text-forward design that puts your biography front and centre before the books.",
    heroStyle: "Text-only name + tagline header",
    typographyNote: "Serif display headings with wide spacing",
    colorNote: "Soft accent tones, mostly white and light grey",
    layoutNote: "Bio header → Books grid → Series → Newsletter",
  },
  {
    id: "bold",
    name: "Bold",
    description: "A dramatic dark hero with large book cover art dominating above the fold. Perfect for thriller, fantasy, and genre fiction.",
    heroStyle: "Full-width dark gradient with oversized covers",
    typographyNote: "Large bold headings, strong visual hierarchy",
    colorNote: "Dark hero with accent colour highlights",
    layoutNote: "Dark hero → Bio strip → Large book grid → Newsletter",
  },
];

export function getTemplate(id: string | null | undefined): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
