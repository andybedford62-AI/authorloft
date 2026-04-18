import Link from "next/link";
import {
  BookOpen,
  Globe,
  CreditCard,
  Users,
  Search,
  Layers,
  Mail,
  Shield,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Tag,
  Heart,
  Zap,
  Wand2,
  Star,
  Feather,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { prisma } from "@/lib/db";

const AUTHOR_TYPES = [
  {
    icon: Heart,
    genre: "Romance & Contemporary",
    description: "Build a beautiful home for your series, capture subscriber emails, and sell direct to your most devoted readers.",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    icon: Zap,
    genre: "Thriller & Mystery",
    description: "Dark, dramatic themes with templates designed to create tension — from the moment a reader lands on your page.",
    gradient: "linear-gradient(135deg, #dc2626, #7c3aed)",
  },
  {
    icon: Wand2,
    genre: "Fantasy & Sci-Fi",
    description: "Showcase complex world-building with series pages, lore sections, and a catalog that grows with your universe.",
    gradient: "linear-gradient(135deg, #7c3aed, #2563eb)",
  },
  {
    icon: Star,
    genre: "Children's & YA",
    description: "Bright, welcoming designs with flip-book previews so young readers can explore before they commit.",
    gradient: "linear-gradient(135deg, #f59e0b, #10b981)",
  },
  {
    icon: Feather,
    genre: "Literary Fiction",
    description: "Understated elegance, rich typography, and a space to share the craft and ideas behind your work.",
    gradient: "linear-gradient(135deg, #1e293b, #334155)",
  },
  {
    icon: Lightbulb,
    genre: "Non-Fiction & Memoir",
    description: "Lead with your credentials, build authority, and let your back catalog speak for your expertise.",
    gradient: "linear-gradient(135deg, #0891b2, #0d9488)",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "Full Book Catalog",
    description:
      "List every title with cover art, series grouping, genre hierarchy, pricing, and buy links.",
  },
  {
    icon: Layers,
    title: "Series & Genre Hierarchy",
    description:
      "Organize books with unlimited nesting — Fiction → Thriller → Underwater Thriller — as deep as you need.",
  },
  {
    icon: Globe,
    title: "Your Own Domain",
    description:
      "Get a subdomain instantly. Bring your own custom domain on Standard and Premium plans.",
  },
  {
    icon: CreditCard,
    title: "Direct Sales",
    description:
      "Sell ebooks and PDFs (or even physical books) directly through your site. Secure Stripe checkout, instant download links.",
  },
  {
    icon: Search,
    title: "Search & Filtering",
    description:
      "Readers can filter your catalog by genre, series, format, and price. Discovery made easy.",
  },
  {
    icon: Mail,
    title: "Newsletter Capture",
    description:
      "Collect subscribers with category preferences. Export to Mailchimp, ConvertKit, or any tool you like.",
  },
  {
    icon: Users,
    title: "Flip Book Previews",
    description:
      "Upload a PDF and give readers an interactive page-turn preview before they buy.",
  },
  {
    icon: Shield,
    title: "Built for Authors",
    description:
      "No coding required. A purpose-built admin panel makes managing your catalog effortless.",
  },
];

async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      tier: true,
      description: true,
      monthlyPriceCents: true,
      annualPriceCents: true,
      featuredLabel: true,
      badgeColor: true,
      maxBooks: true,
      maxPosts: true,
      maxStorageMb: true,
      customDomain: true,
      salesEnabled: true,
      newsletter: true,
      analyticsEnabled: true,
      flipBooksLimit: true,
      isDefault: true,
    },
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);
}

export default async function MarketingPage() {
  const plans = await getActivePlans();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-lg text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              Features
            </a>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              Sign In
            </Link>
          </nav>
          <Link href="/register">
            <Button
              size="sm"
              className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-px"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-28 text-center space-y-8">

          {/* Early-access badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Now in early access
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up animate-delay-100 font-heading text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
            Your complete author
            <span className="text-shimmer"> website platform</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up animate-delay-200 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            AuthorLoft gives every author a beautiful, fully-featured website — with catalog
            management, digital sales, newsletter signup, and flip book previews — in minutes,
            not months.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Start for Free <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/apbedford">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                View Demo Site <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <p className="animate-fade-up animate-delay-400 text-blue-300/80 text-sm">
            Free plan available · No credit card required
          </p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Section heading */}
          <ScrollReveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Features
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything an author needs
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Purpose-built features that go way beyond a basic website builder.
            </p>
          </ScrollReveal>

          {/* Feature cards — each reveals with a staggered delay */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal key={title} delay={index * 70}>
                <div className="group h-full bg-white rounded-xl border border-gray-200 p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-default">
                  <div className="p-2.5 bg-blue-50 rounded-lg w-fit group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
              <Users className="h-3.5 w-3.5" />
              Who It&apos;s For
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for every kind of author
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Whether you write sweeping epics or slim novellas, AuthorLoft gives you a home that fits.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AUTHOR_TYPES.map(({ icon: Icon, genre, description, gradient }, i) => (
              <ScrollReveal key={genre} delay={i * 70}>
                <div className="group h-full bg-white rounded-2xl border border-gray-100 p-6 space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300"
                    style={{ background: gradient }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{genre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Section heading */}
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
              <Tag className="h-3.5 w-3.5" />
              Pricing
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg">
              Start free. Upgrade when you&apos;re ready to grow.
            </p>
          </ScrollReveal>

          {plans.length > 0 ? (
            <PricingSection plans={plans} />
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Pricing plans coming soon.
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View full feature comparison <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <span className="text-white font-bold">
              Author<span className="text-blue-400">Loft</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AuthorLoft. Built for authors, by someone who
            actually loves books.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
