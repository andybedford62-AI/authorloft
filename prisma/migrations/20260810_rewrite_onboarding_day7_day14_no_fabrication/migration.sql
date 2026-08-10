-- Rewrite onboarding-day7 and onboarding-day14, dropping numeric social proof
-- entirely per decision 2026-08-10. Real platform stats were checked (11
-- active authors, $0 revenue and 0 new subscribers in the trailing 7 days)
-- and don't support a "look how well everyone's doing" framing -- rewriting
-- with genuinely real numbers would read as discouraging, and reusing the
-- old fabricated numbers would just swap one fabrication for another.
--
-- Also corrected against docs/FEATURE_MATRIX.md (2026-08-07), which the old
-- copy got wrong independent of the fabrication issue:
--   - Standard plan caps at 20 books, not unlimited (only Premium is unlimited)
--   - Flip Books are Premium-only, not included in Standard
--   - Standard is $19.99/mo, not $12/mo
--   - The "keep more per sale / lower fees" claim has no basis in the
--     feature matrix or codebase -- dropped rather than repeated
-- Day 14's fake "Author Spotlight (10,000+ readers)" P.S. is also dropped --
-- real total subscriber count platform-wide is 3.

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>You're a week in — nice work getting your first book live.</strong></p>
<p>Here's what tends to make the biggest difference in the first few weeks:</p>
<p><strong>1. Share your link on social</strong> (60 seconds)<br>
Your readers already follow you there — a quick post goes a long way.</p>
<p><strong>2. Send your first newsletter</strong> (5 minutes)<br>
Email the readers you've already captured at checkout.<br>
Pro tip: share a behind-the-scenes story, not just "buy my book."</p>
<p><strong>3. Add your second book</strong> (even a free short story)<br>
More books = more reasons for readers to stick around.</p>
<p>Which one feels easiest to you? Start there.</p>
<p>→ <a href="https://www.authorloft.com/admin/dashboard">Share your site</a><br>
→ <a href="https://www.authorloft.com/admin/newsletter">Send first newsletter</a></p>
<p>You're building something real here.</p>
<p>— The AuthorLoft Team</p>
<p>P.S. Ready to grow? <strong>Standard</strong> ($19.99/mo) unlocks a custom domain and sales revenue charts — <strong>Premium</strong> ($59.99/mo) adds audio books and flip-book previews. <a href="https://www.authorloft.com/pricing">See plans</a></p>$body$ WHERE id = 'onboarding-day7';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Two weeks in — how's it going?</strong></p>
<p>If you're finding your footing on Free and want more room to grow, here's where most authors move to next:</p>
<p><strong>Free → Standard ($19.99/mo or $199.99/yr)</strong></p>
<p><strong>Feature Comparison:</strong><br>
- Books: Free = up to 5 | Standard = up to 20 — room for a real catalog<br>
- Custom domain: Free = No | Standard = Yes — looks professional, drives trust<br>
- Sales revenue charts: Free = No | Standard = Yes — know what's actually selling<br>
- Sales formats: Free = eBook only | Standard = eBook + Print<br>
- Pre-orders & affiliate program: Free = No | Standard = Yes</p>
<p><strong>Or Stay Free</strong></p>
<p>No pressure. Free plan works great for:<br>
- Testing the platform<br>
- A first book or two<br>
- Email-only reader capture</p>
<p>→ <a href="https://www.authorloft.com/pricing">Upgrade to Standard</a><br>
→ <a href="https://www.authorloft.com/admin/dashboard">Keep exploring on Free</a></p>
<p>You're doing the hard part — writing and publishing. We're here to handle the rest.</p>
<p>Questions? Just reply.</p>
<p>— The AuthorLoft Team</p>$body$ WHERE id = 'onboarding-day14';
