'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { PlanData } from './pricing-section';
import { VAULT } from '@/components/marketing/vault-theme';

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
  const [annual, setAnnual] = useState(false);

  if (plans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: VAULT.mute, fontSize: 14, fontFamily: 'var(--font-geist-mono, monospace)' }}>
        Pricing plans coming soon.
      </div>
    );
  }

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: !annual ? VAULT.ink : VAULT.mute }}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          aria-label="Toggle billing period"
          style={{
            width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
            background: annual ? VAULT.gold : VAULT.surf2, position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: annual ? 25 : 3,
            width: 20, height: 20, borderRadius: '50%', background: VAULT.ink,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: annual ? VAULT.ink : VAULT.mute }}>
          Annual <span style={{ fontSize: 12, color: VAULT.gold, fontWeight: 600 }}>save 20%</span>
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16, alignItems: 'start' }}>
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
                background: isFeatured ? VAULT.surf2 : VAULT.surf,
                color: VAULT.ink,
                border: isFeatured ? `2px solid ${VAULT.gold}` : `1px solid ${VAULT.hair}`,
                transform: isFeatured ? 'scale(1.04)' : 'none',
                boxShadow: isFeatured ? '0 30px 50px -20px rgba(22,35,61,0.55), 0 0 20px rgba(214,169,74,0.15)' : '0 2px 8px rgba(0,0,0,0.15)',
                position: 'relative',
                textAlign: 'left',
              }}
            >
              {/* Badge */}
              {plan.featuredLabel && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: VAULT.gold,
                  color: VAULT.bg, fontSize: 11, fontWeight: 700,
                  padding: '5px 16px', borderRadius: 999,
                  fontFamily: 'var(--font-geist-mono, monospace)', letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(214,169,74,0.3)',
                }}>
                  {plan.featuredLabel}
                </div>
              )}

              {/* Plan name */}
              <h3 style={{ fontFamily: VAULT.fontDisplay, fontStyle: 'italic', fontSize: 32, fontWeight: 400, margin: '0 0 12px', color: isFeatured ? VAULT.gold : `${VAULT.gold}99`, textAlign: 'left' }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6, textAlign: 'left' }}>
                <span style={{ fontFamily: VAULT.fontDisplay, fontSize: 56, fontWeight: 400, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
                  {price}
                </span>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, opacity: 0.6 }}>
                  {annual && plan.annualPriceCents > 0 ? '/mo · billed yearly' : '/month'}
                </span>
              </div>

              {/* Description */}
              {plan.description && (
                <p style={{ fontFamily: VAULT.fontBody, fontSize: 14, lineHeight: 1.6, opacity: 0.85, margin: '12px 0 20px', textAlign: 'left' }}>
                  {plan.description}
                </p>
              )}

              {/* CTA */}
              <Link
                href="/register"
                style={{
                  display: 'block', textAlign: 'center', padding: '13px 0',
                  borderRadius: VAULT.radius, fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', marginBottom: 24,
                  background: isFeatured ? VAULT.gold : 'transparent',
                  color: isFeatured ? VAULT.bg : VAULT.ink,
                  border: isFeatured ? 'none' : `1px solid ${VAULT.gold}66`,
                  transition: 'opacity 0.15s',
                }}
              >
                {plan.monthlyPriceCents === 0 ? 'Start for free →' : `Start free — ${plan.name} →`}
              </Link>

              {/* Features */}
              {features.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: `1px solid ${VAULT.hair}`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {features.map((feat, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                      <Check style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: VAULT.gold }} />
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
      <p style={{ textAlign: 'left', marginTop: 32, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: VAULT.mute, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Stripe fees apply to direct sales · 30-day money-back guarantee · cancel anytime
      </p>
    </div>
  );
}
