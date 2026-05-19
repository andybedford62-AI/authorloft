'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { PlanData } from './pricing-section';

function formatMonthly(cents: number) {
  if (cents === 0) return '$0';
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
}

function formatAnnualMonthly(annualCents: number) {
  if (annualCents === 0) return null;
  const perMonth = annualCents / 12 / 100;
  return perMonth % 1 === 0 ? `$${perMonth.toFixed(0)}` : `$${perMonth.toFixed(2)}`;
}

function buildFeatures(plan: PlanData): string[] {
  const f: string[] = [];
  if (plan.featuresJson) {
    try {
      const parsed = JSON.parse(plan.featuresJson);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch { /* fall through to auto-build */ }
  }
  f.push(plan.maxBooks === null ? 'Unlimited books' : `Up to ${plan.maxBooks} book${plan.maxBooks === 1 ? '' : 's'}`);
  if (plan.customDomain) f.push('Custom domain');
  if (plan.salesEnabled) f.push('Direct sales via Stripe');
  if (plan.newsletter) f.push('Newsletter capture');
  if (plan.analyticsEnabled) f.push('Reader analytics');
  if (plan.flipBooksLimit > 0) f.push(plan.flipBooksLimit >= 999 ? 'Unlimited flip books' : `Up to ${plan.flipBooksLimit} flip books`);
  if (plan.mediaKitEnabled) f.push('Media kit page');
  return f;
}

export function MidnightPricingSection({ plans }: { plans: PlanData[] }) {
  const [annual, setAnnual] = useState(true);

  if (plans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#8993A4', fontSize: 14, fontFamily: 'var(--font-geist-mono, monospace)' }}>
        Pricing plans coming soon.
      </div>
    );
  }

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: !annual ? '#1B2B47' : '#8993A4' }}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          aria-label="Toggle billing period"
          style={{
            width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
            background: annual ? '#B8893D' : '#DCDBD3', position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: annual ? 25 : 3,
            width: 20, height: 20, borderRadius: '50%', background: '#E8E5DD',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: annual ? '#1B2B47' : '#8993A4' }}>
          Annual <span style={{ fontSize: 12, color: '#B8893D', fontWeight: 600 }}>save 20%</span>
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
        {plans.map((plan, i) => {
          const isFeatured = plan.featuredLabel !== null || plan.tier === 'STANDARD';
          const price = annual
            ? (formatAnnualMonthly(plan.annualPriceCents) ?? formatMonthly(plan.monthlyPriceCents))
            : formatMonthly(plan.monthlyPriceCents);
          const features = buildFeatures(plan);

          return (
            <div
              key={plan.id}
              style={{
                borderRadius: 18,
                padding: '32px 28px',
                background: isFeatured ? '#1B2B47' : '#F0EDE4',
                color: isFeatured ? '#E8E5DD' : '#1B2B47',
                border: isFeatured ? 'none' : '1px solid #DCDBD3',
                transform: isFeatured ? 'scale(1.04)' : 'none',
                boxShadow: isFeatured ? '0 30px 50px -20px rgba(15,26,45,0.55)' : '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              {/* Badge */}
              {plan.featuredLabel && (
                <div style={{
                  position: 'absolute', top: -12, right: 20,
                  background: isFeatured ? '#D4AE6A' : '#C26A4A',
                  color: '#0F1A2D', fontSize: 11, fontWeight: 700,
                  padding: '4px 12px', borderRadius: 999,
                  fontFamily: 'var(--font-geist-mono, monospace)', letterSpacing: '0.08em',
                }}>
                  {plan.featuredLabel}
                </div>
              )}

              {/* Plan name */}
              <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 32, fontWeight: 400, margin: '0 0 12px', color: isFeatured ? '#D4AE6A' : '#C26A4A' }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 56, fontWeight: 400, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
                  {price}
                </span>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, opacity: 0.6 }}>
                  {annual && plan.annualPriceCents > 0 ? '/mo · billed yearly' : '/month'}
                </span>
              </div>

              {/* Description */}
              {plan.description && (
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.6, opacity: 0.85, margin: '12px 0 20px' }}>
                  {plan.description}
                </p>
              )}

              {/* CTA */}
              <Link
                href="/register"
                style={{
                  display: 'block', textAlign: 'center', padding: '13px 0',
                  borderRadius: 999, fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', marginBottom: 24,
                  background: isFeatured ? '#D4AE6A' : '#1B2B47',
                  color: isFeatured ? '#0F1A2D' : '#E8E5DD',
                  transition: 'opacity 0.15s',
                }}
              >
                {plan.monthlyPriceCents === 0 ? 'Start for free' : 'Start 14-day trial'}
              </Link>

              {/* Features */}
              {features.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.15)' : '#DCDBD3'}`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {features.map((feat, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                      <Check style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: isFeatured ? '#D4AE6A' : '#B8893D' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', marginTop: 32, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: '#8993A4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Stripe fees apply to direct sales · 30-day money-back guarantee · cancel anytime
      </p>
    </div>
  );
}
