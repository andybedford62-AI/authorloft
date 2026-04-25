// Shared prop types for all home page templates

export interface AuthorForTemplate {
  id: string;
  name: string;
  displayName: string | null;
  slug: string;
  shortBio: string | null;
  bio: string | null;
  tagline: string | null;
  profileImageUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string;
  siteTheme: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  showHeroBanner: boolean;
  homeTemplate: string;
  heroFeaturedBook: { title: string; slug: string; coverImageUrl: string | null; caption: string | null } | null;
  credentials: string[] | null;
  plan: { salesEnabled: boolean } | null;
}

export interface BookForTemplate {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  shortDescription: string | null;
  coverImageUrl: string | null;
  priceCents: number;
  isFeatured: boolean;
  directSalesEnabled: boolean;
  externalBuyUrl: string | null;
  caption: string | null;
  releaseDate: Date | null;
  series: { id: string; name: string; slug: string } | null;
  retailerLinks: { id: string; retailer: string; label: string; url: string }[];
  directSaleItems: { id: string; format: string; label: string; description: string | null; priceCents: number }[];
}

export interface SeriesForTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  books: { id: string; title: string; slug: string; coverImageUrl: string | null; priceCents: number }[];
}

export interface GenreForTemplate {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export interface HomeTemplateProps {
  author: AuthorForTemplate;
  books: BookForTemplate[];
  series: SeriesForTemplate[];
  genreTree: GenreForTemplate[];
}
