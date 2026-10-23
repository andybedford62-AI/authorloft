-- Help Centre content for print shipping profiles: 5 in-form tooltips + 1 guide article.
-- Data only (no schema change). Idempotent: safe to re-run; re-running overwrites edits made in Super Admin.

INSERT INTO "HelpTooltip" ("id", "tooltipKey", "title", "content", "learnMoreUrl", "updatedAt") VALUES
 ('ht_ship_profile', 'shipping-profile', 'Shipping profile',
  $$A shipping profile is a saved set of postage prices. Make one for each kind of print book (for example Paperback and Hardcover), then choose it on each print edition. Change a price here once and every edition using the profile follows.$$,
  '/admin/help?article=ha_print_shipping', CURRENT_TIMESTAMP),
 ('ht_ship_first_additional', 'shipping-first-additional', 'First copy / each additional copy',
  $$First copy is what you charge to mail one book. Each additional copy is the smaller amount added for every extra book in the same order, since they ship in one package. Example: $5.00 first and $2.00 additional means 3 books ship for $9.00.$$,
  '/admin/help?article=ha_print_shipping', CURRENT_TIMESTAMP),
 ('ht_ship_international', 'shipping-international', 'Shipping to other countries',
  $$Turn this on to accept orders from outside your country, at one price for all of them. Leave it off to sell only within your own country. Buyers in countries you don't ship to will be told you can't send the book there.$$,
  '/admin/help?article=ha_print_shipping', CURRENT_TIMESTAMP),
 ('ht_ship_free_over', 'shipping-free-over', 'Free shipping over',
  $$Optional. When the books in an order that use this profile add up to at least this amount (before discount codes), shipping for them is free. Leave it empty to always charge postage.$$,
  '/admin/help?article=ha_print_shipping', CURRENT_TIMESTAMP),
 ('ht_ship_specific', 'shipping-specific-countries', 'Prices for specific countries',
  $$Use this when one country needs its own price, for example a lower rate to Canada than to everywhere else. Add the countries, then set their prices. Most authors only need the two prices above and can skip this.$$,
  '/admin/help?article=ha_print_shipping', CURRENT_TIMESTAMP)
ON CONFLICT ("tooltipKey") DO UPDATE
  SET "title" = EXCLUDED."title", "content" = EXCLUDED."content", "learnMoreUrl" = EXCLUDED."learnMoreUrl", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "HelpArticle" ("id", "topicId", "subtopicId", "question", "answer", "sortOrder", "isPublished", "updatedAt")
VALUES (
  'ha_print_shipping', 'ht_pay', 'hst_p2',
  '<p>How does shipping work for my print books?</p>',
  $$<p>When a reader buys a print edition, <strong>you</strong> print and mail it. AuthorLoft collects the shipping fee at checkout and emails you the buyer's address; you keep all of it, so set prices that cover your real postage.</p>
<h3>Set it up in 3 steps</h3>
<ol>
<li>Go to <strong>Settings → Shipping</strong> (or choose <em>+ New shipping profile</em> while adding a print edition) and pick the country you ship from.</li>
<li>Create a <strong>shipping profile</strong>, for example "Paperback". Enter the price for the <strong>first copy</strong> and a smaller price for <strong>each additional copy</strong>.</li>
<li>Open the print edition (Books → your book → Direct Sales) and choose the profile. The edition can't be activated until it has one.</li>
</ol>
<h3>Shipping to other countries</h3>
<p>Tick <strong>I also ship to other countries</strong> and enter one price for everywhere else. Leave it unticked to sell only in your own country. Under <em>More options</em> you can give a specific country its own price, such as a lower rate to Canada.</p>
<h3>How the total is worked out</h3>
<ul>
<li>The buyer chooses their country in the cart and sees the shipping price before paying.</li>
<li>Example: first copy $5.00 and each additional $2.00. A buyer ordering 3 paperbacks pays $5.00 + $2.00 + $2.00 = <strong>$9.00</strong>.</li>
<li>If an order mixes profiles (for example a paperback and a hardcover), the highest first-copy price is charged once, and every other book is charged its own additional-copy price.</li>
<li>If you set <strong>Free shipping over</strong>, books using that profile ship free once their combined price reaches the amount (before discount codes).</li>
<li>A buyer in a country you don't ship to is told so and can't check out with that print edition.</li>
</ul>
<h3>Good to know</h3>
<ul>
<li>Changing a profile affects new orders only. Past orders keep the shipping they were charged.</li>
<li>Shipping prices are in US dollars for now.</li>
<li>Add a <strong>delivery time</strong> such as "5-7 business days" and buyers see it next to the price.</li>
<li>After an order arrives, mail the book and use <strong>Mark as shipped</strong> in Sales to add a tracking number and let the buyer know.</li>
</ul>$$,
  50, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE
  SET "question" = EXCLUDED."question", "answer" = EXCLUDED."answer", "updatedAt" = CURRENT_TIMESTAMP;
