-- 045: KUMIKI — scarcity messaging: limited to 10 pieces per month (idempotent)
-- Safe to run whether or not the previous "30点" version was executed.

-- Remove old 30-piece sentence if present
UPDATE products SET
  description = replace(description, ' 工房の月産は30点まで。ひとつずつ、職人が仕立てます。', ''),
  description_en = replace(description_en, ' Our atelier crafts no more than 30 pieces per month, each finished by a single artisan.', '')
WHERE slug LIKE 'kumiki-%';

-- Append 10-piece sentence
UPDATE products SET
  description = description || ' 工房の月産は10点まで。ひとつずつ、職人が仕立てます。',
  description_en = description_en || ' Our atelier crafts no more than 10 pieces per month, each finished by a single artisan.'
WHERE slug LIKE 'kumiki-%'
  AND description NOT LIKE '%月産は10点%';
