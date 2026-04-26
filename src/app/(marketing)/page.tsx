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
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // fallback: refresh at most every hour

// ── Data ─────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: Check, text: "Free plan, forever" },
  { icon: Check, text: "No credit card required" },
  { icon: Check, text: "Live in under 5 minutes" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    body: "Sign up free in seconds. No technical knowledge needed — just your name and email.",
  },
  {
    step: "02",
    title: "Add your books",
    body: "Upload covers, write descriptions, link to retailers, and organise by series or genre.",
  },
  {
    step: "03",
    title: "Share with readers",
    body: "Your site goes live instantly on your own subdomain. Add a custom domain whenever you're ready.",
  },
];

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
    description: "List every title with cover art, series grouping, genre hierarchy, pricing, and buy links.",
  },
  {
    icon: Layers,
    title: "Series & Genre Hierarchy",
    description: "Organize books with unlimited nesting — Fiction → Thriller → Underwater Thriller — as deep as you need.",
  },
  {
    icon: Globe,
    title: "Your Own Domain",
    description: "Get a subdomain instantly. Bring your own custom domain on Standard and Premium plans.",
  },
  {
    icon: CreditCard,
    title: "Direct Sales",
    description: "Sell ebooks and PDFs directly through your site. Secure Stripe checkout, instant download links.",
  },
  {
    icon: Search,
    title: "Search & Filtering",
    description: "Readers can filter your catalog by genre, series, format, and price. Discovery made easy.",
  },
  {
    icon: Mail,
    title: "Newsletter Capture",
    description: "Collect subscribers with category preferences. Export to Mailchimp, ConvertKit, or any tool.",
  },
  {
    icon: Users,
    title: "Flip Book Previews",
    description: "Upload a PDF and give readers an interactive page-turn preview before they buy.",
  },
  {
    icon: Shield,
    title: "Built for Authors",
    description: "No coding required. A purpose-built admin panel makes managing your catalog effortless.",
  },
];

// ── Server data ───────────────────────────────────────────────────────────────

async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, tier: true, description: true, featuresJson: true,
      monthlyPriceCents: true, annualPriceCents: true,
      featuredLabel: true, badgeColor: true,
      maxBooks: true, maxPosts: true, maxStorageMb: true,
      customDomain: true, salesEnabled: true, newsletter: true,
      analyticsEnabled: true, flipBooksLimit: true, isDefault: true,
    },
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);
}

async function getHeroImageUrl(): Promise<string> {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where:  { id: "singleton" },
      select: { marketingHeroImageUrl: true },
    });
    return settings?.marketingHeroImageUrl || "/author-site-preview.png";
  } catch {
    return "/author-site-preview.png";
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MarketingPage() {
  const [plans, heroImageUrl] = await Promise.all([getActivePlans(), getHeroImageUrl()]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/AL_site_Logo-Blue.png" alt="AuthorLoft" width={160} height={48} className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">How it works</a>
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">Sign In</Link>
          </nav>
          <Link href="/register">
            <Button size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-px">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#060d1f] via-[#0d1b3e] to-[#0a1a3a] text-white min-h-[92vh] flex items-center">
        {/* Background blobs */}
        <div className="absolute -top-48 -right-48 w-[36rem] h-[36rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className="space-y-8">
            <div className="animate-fade-up inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Now in early access — free plan available
            </div>

            <h1 className="animate-fade-up animate-delay-100 font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Your books
              <br />
              deserve a
              <br />
              <span className="text-shimmer">better home.</span>
            </h1>

            <p className="animate-fade-up animate-delay-200 text-lg sm:text-xl text-blue-100/80 max-w-lg leading-relaxed">
              AuthorLoft gives every author a beautiful website — complete with book catalog,
              newsletter, and digital storefront — up and running in minutes.
            </p>

            <div className="animate-fade-up animate-delay-300 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-950 hover:bg-blue-50 font-bold px-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Start for Free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="https://demo.authorloft.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
                >
                  View Demo Site <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </a>
            </div>

            {/* Trust pills */}
            <div className="animate-fade-up animate-delay-400 flex flex-wrap gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-blue-200/70">
                  <Icon className="h-3.5 w-3.5 text-green-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — author site screenshot */}
          <div className="animate-fade-up animate-delay-200 hidden lg:flex justify-end items-start">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-lg w-full">
              <Image
                src={heroImageUrl}
                alt="Example author site built on AuthorLoft"
                width={1092}
                height={1404}
                className="w-full h-auto"
                priority
                unoptimized={heroImageUrl.startsWith("http")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Simple setup
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Live in three steps
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              No developers. No agencies. No months of waiting.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 pointer-events-none" />

            {HOW_IT_WORKS.map(({ step, title, body }, i) => (
              <ScrollReveal key={step} delay={i * 100} direction="up">
                <div className="relative text-center space-y-4 px-4">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 mx-auto">
                    <span className="text-2xl font-black tracking-tight">{step}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900">{title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center mt-14">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                Create my free site <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal key={title} delay={index * 60} direction={index % 2 === 0 ? "up" : "scale"}>
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
              <ScrollReveal key={genre} delay={i * 70} direction={i % 3 === 1 ? "scale" : "up"}>
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

          <ScrollReveal direction="scale">
            {plans.length > 0 ? (
              <PricingSection plans={plans} />
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Pricing plans coming soon.
              </div>
            )}
          </ScrollReveal>

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

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 py-24">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <ScrollReveal>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
              Ready to build your author platform?
            </h2>
            <p className="text-blue-100/80 text-lg mt-4 max-w-xl mx-auto">
              Join AuthorLoft free today. Your readers are looking for you — make it easy for them to find you.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-950 hover:bg-blue-50 font-bold px-10 shadow-2xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                >
                  Start for Free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <p className="text-blue-300/60 text-sm">No credit card · Free plan forever</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image src="/AL_site_Logo-Dark_footer.png" alt="AuthorLoft" width={140} height={40} className="h-8 w-auto" />
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AuthorLoft. Built for authors, by someone who actually loves books.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors duration-200">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
